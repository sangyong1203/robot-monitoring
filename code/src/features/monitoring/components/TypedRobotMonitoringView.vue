<template>
    <section class="typed-monitoring">
        <div class="typed-monitoring__metrics">
            <article class="typed-monitoring__metric">
                <span>대상 로봇</span><strong>{{ snapshot?.counts.total ?? 0 }}</strong>
            </article>
            <article class="typed-monitoring__metric">
                <span>정상</span><strong class="is-online">{{ snapshot?.counts.online ?? 0 }}</strong>
            </article>
            <article class="typed-monitoring__metric">
                <span>통신 지연</span><strong class="is-stale">{{ snapshot?.counts.stale ?? 0 }}</strong>
            </article>
            <article class="typed-monitoring__metric">
                <span>오프라인</span><strong class="is-offline">{{ snapshot?.counts.offline ?? 0 }}</strong>
            </article>
        </div>

        <div class="typed-monitoring__content">
            <Panel class="typed-monitoring__map-panel" title="위치 모니터링" :subtitle="updatedLabel">
                <template #headerRight>
                    <el-select v-model="selectedMapId" class="typed-monitoring__map-select" placeholder="맵 선택">
                        <el-option
                            v-for="map in snapshot?.maps ?? []"
                            :key="map.id"
                            :label="map.name"
                            :value="map.id"
                        />
                    </el-select>
                    <StatusBadge
                        :label="connectionLabel"
                        :variant="connectionState === 'CONNECTED' ? 'success' : 'info'"
                    />
                </template>
                <div
                    v-if="loading"
                    class="content-loading-placeholder typed-monitoring__loading"
                    aria-label="로봇 모니터링 불러오는 중"
                ></div>
                <el-empty v-else-if="!selectedMap" :description="`${title}에 표시할 맵이 없습니다.`" />
                <div v-else class="typed-monitoring__map-wrap">
                    <svg
                        class="typed-monitoring__map"
                        :viewBox="`0 0 ${selectedMap.width} ${selectedMap.height}`"
                        role="img"
                    >
                        <defs>
                            <pattern :id="gridId" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path
                                    d="M 50 0 L 0 0 0 50"
                                    fill="none"
                                    stroke="#64748b"
                                    stroke-width="1"
                                    opacity="0.25"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="#101827" />
                        <image
                            v-if="mapImageSource && !imageFailed"
                            :href="mapImageSource"
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            @error="imageFailed = true"
                        />
                        <rect width="100%" height="100%" :fill="`url(#${gridId})`" />
                        <g
                            v-for="robot in selectedMap.robots"
                            :key="robot.id"
                            class="typed-monitoring__marker"
                            :transform="markerTransform(robot)"
                            @click="selectedRobotId = robot.id"
                        >
                            <circle
                                :r="selectedRobotId === robot.id ? 19 : 15"
                                :fill="markerColor(robot.communicationStatus)"
                                stroke="#fff"
                                stroke-width="3"
                            />
                            <path
                                d="M 0 -12 L 6 4 L 0 1 L -6 4 Z"
                                fill="#fff"
                                :transform="`rotate(${robot.heading})`"
                            />
                            <text x="22" y="-8" class="typed-monitoring__marker-name">{{ robot.name }}</text>
                            <text x="22" y="10" class="typed-monitoring__marker-state">
                                {{ communicationLabel(robot.communicationStatus) }}
                            </text>
                        </g>
                    </svg>
                </div>
            </Panel>

            <Panel class="typed-monitoring__list-panel" title="로봇 상태">
                <template #headerRight>
                    <span class="typed-monitoring__robot-count">{{ robots.length }}대</span>
                </template>
                <el-empty v-if="robots.length === 0 && !loading" description="대상 로봇이 없습니다." />
                <article
                    v-for="robot in robots"
                    :key="robot.id"
                    class="typed-monitoring__robot"
                    :class="{ 'is-selected': selectedRobotId === robot.id }"
                    tabindex="0"
                    @click="selectRobot(robot)"
                    @keyup.enter="selectRobot(robot)"
                >
                    <span class="typed-monitoring__robot-heading">
                        <strong>{{ robot.name }}</strong>
                        <StatusBadge
                            :label="communicationLabel(robot.communicationStatus)"
                            :variant="statusTag(robot.communicationStatus)"
                        />
                    </span>
                    <span>운영 상태 {{ statusLabel(robot.status) }} · 배터리 {{ robot.batteryPercent }}%</span>
                    <span>X {{ robot.x.toFixed(2) }}m · Y {{ robot.y.toFixed(2) }}m</span>
                    <span>마지막 수신 {{ formatLastSeen(robot.lastSeenAt) }}</span>
                </article>
                <el-alert
                    v-if="selectedRobot?.communicationStatus === 'OFFLINE'"
                    class="typed-monitoring__control-state"
                    type="error"
                    title="오프라인 로봇에는 명령을 전송할 수 없습니다."
                    :closable="false"
                />
                <el-button
                    v-if="canExecute"
                    class="typed-monitoring__control-button"
                    type="primary"
                    :disabled="!selectedRobot || selectedRobot.communicationStatus === 'OFFLINE'"
                    @click="openControlDialog"
                >
                    선택 로봇 수동제어
                </el-button>
                <StatusBadge
                    v-else
                    class="typed-monitoring__read-only"
                    label="조회 전용 권한"
                    variant="info"
                    min-width="88px"
                />
            </Panel>
        </div>

        <BaseDialog
            v-model="controlDialogVisible"
            class="typed-monitoring__control-dialog"
            :title="`${selectedRobot?.name ?? ''} 수동제어`"
            width="580px"
            :close-on-click-modal="false"
        >
            <el-alert
                class="typed-monitoring__command-notice"
                type="info"
                title="명령 접수 성공과 실제 로봇 상태 변화는 별개입니다. 적용 상태는 실시간 모니터링으로 확인하세요."
                :closable="false"
                show-icon
            />
            <el-form label-position="top">
                <el-form-item label="명령" required>
                    <el-select
                        v-model="commandForm.commandType"
                        class="typed-monitoring__form-control"
                        @change="resetCommandResult"
                    >
                        <el-option label="목적지 이동" value="MOVE_TO" />
                        <el-option label="운영 모드 변경" value="SET_MODE" />
                        <el-option label="미션 시작" value="START_MISSION" />
                        <el-option label="Safe Stop" value="SAFE_STOP" />
                    </el-select>
                </el-form-item>
                <div v-if="commandForm.commandType === 'MOVE_TO'" class="typed-monitoring__form-grid">
                    <el-form-item label="목적지 X (m)" required>
                        <el-input-number v-model="commandForm.x" :precision="4" />
                    </el-form-item>
                    <el-form-item label="목적지 Y (m)" required>
                        <el-input-number v-model="commandForm.y" :precision="4" />
                    </el-form-item>
                </div>
                <el-form-item v-else-if="commandForm.commandType === 'SET_MODE'" label="운영 모드" required>
                    <el-radio-group v-model="commandForm.mode">
                        <el-radio-button value="AUTO">자동</el-radio-button>
                        <el-radio-button value="MANUAL">수동</el-radio-button>
                        <el-radio-button value="PAUSED">일시정지</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-else-if="commandForm.commandType === 'START_MISSION'" label="미션 ID" required>
                    <el-input-number v-model="commandForm.missionId" :min="1" :precision="0" />
                </el-form-item>
                <template v-else>
                    <el-alert
                        class="typed-monitoring__safe-stop-warning"
                        type="error"
                        title="Safe Stop은 현재 로봇 동작을 안전 정지시키는 별도 명령입니다."
                        :closable="false"
                        show-icon
                    />
                    <el-form-item label="정지 사유">
                        <el-input v-model="commandForm.reason" maxlength="200" />
                    </el-form-item>
                    <el-checkbox v-model="commandForm.safeStopConfirmed">
                        Safe Stop의 영향과 대상 로봇을 확인했습니다.
                    </el-checkbox>
                </template>
            </el-form>
            <el-alert
                v-if="commandResult"
                class="typed-monitoring__command-result"
                :type="commandResult.status === 'REJECTED' ? 'error' : 'success'"
                :title="`명령 #${commandResult.id} ${commandStatusLabel(commandResult.status)}`"
                :description="
                    commandResult.stateChangePending
                        ? '실제 상태 변화를 기다리는 중입니다.'
                        : '로봇 적용 상태가 기록되었습니다.'
                "
                show-icon
                :closable="false"
            />
            <template #footer>
                <el-button @click="controlDialogVisible = false">닫기</el-button>
                <el-button
                    :type="commandForm.commandType === 'SAFE_STOP' ? 'danger' : 'primary'"
                    :loading="commandSaving"
                    @click="submitCommand"
                >
                    {{ commandForm.commandType === 'SAFE_STOP' ? 'Safe Stop 접수' : '명령 접수' }}
                </el-button>
            </template>
        </BaseDialog>
    </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import { RealtimeClient } from '@/services/realtime.service'
import type { RealtimeConnectionState, RealtimeSnapshot } from '@/services/realtime.service'
import { useAuthStore } from '@/stores/auth.store'
import { formatDateTime } from '@/utils/date.util'
import { worldToPixel } from '@/utils/mapCoordinates'
import { useAuthenticatedMapImage } from '@/composables/useAuthenticatedMapImage'
import type {
    CommunicationStatus,
    IntegratedMonitoringSnapshot,
    MonitoringMap,
    MonitoringRobot,
} from '../service/integrated/integratedMonitoring.types'
import { getTypedMonitoring, sendRobotCommand } from '../service/typed/typedMonitoring.api'
import type {
    RobotCommandResult,
    RobotCommandStatus,
    RobotCommandType,
    TypedMonitoringKind,
} from '../service/typed/typedMonitoring.api'
import { mergeRobotRealtimeDelta } from '../service/typed/realtimeRobotMerge'
import type { RobotRealtimeDelta } from '../service/typed/realtimeRobotMerge'

const props = defineProps<{ kind: TypedMonitoringKind; title: string }>()
const authStore = useAuthStore()
const snapshot = ref<IntegratedMonitoringSnapshot | null>(null)
const loading = ref(false)
const realtimeNotificationShown = ref(false)
const selectedMapId = ref<number | null>(null)
const selectedRobotId = ref<number | null>(null)
const imageFailed = ref(false)
const connectionState = ref<RealtimeConnectionState>('DISCONNECTED')
const controlDialogVisible = ref(false)
const commandSaving = ref(false)
const commandResult = ref<RobotCommandResult | null>(null)
const commandForm = reactive({
    commandType: 'MOVE_TO' as RobotCommandType,
    x: 0,
    y: 0,
    mode: 'AUTO',
    missionId: 1,
    reason: '',
    safeStopConfirmed: false,
})
const gridId = computed(() => `typed-grid-${props.kind.toLowerCase()}`)
const selectedMap = computed(() => snapshot.value?.maps.find((map: MonitoringMap) => map.id === selectedMapId.value) ?? null)
const selectedMapImageUrl = computed(() => selectedMap.value?.imageUrl ?? '')
const { imageSource: mapImageSource, imageLoadFailed } = useAuthenticatedMapImage(selectedMapImageUrl)
const robots = computed(() => snapshot.value?.robots ?? [])
const selectedRobot = computed(() => robots.value.find((robot: MonitoringRobot) => robot.id === selectedRobotId.value) ?? null)
const hasCommunicationIssue = computed(() =>
    Boolean((snapshot.value?.counts.stale ?? 0) + (snapshot.value?.counts.offline ?? 0)),
)
const updatedLabel = computed(() =>
    snapshot.value?.generatedAt ? `기준 ${formatDateTime(snapshot.value.generatedAt)}` : '조회 대기',
)
const screenId = computed(() => (props.kind === 'WORK' ? 'IMCS-MT-02' : 'IMCS-MT-03'))
const role = computed(() => authStore.authState.user?.userLevel ?? 'VIEWER')
const canExecute = computed(() => true)
const connectionLabel = computed(
    () =>
        ({
            CONNECTING: '실시간 연결 중',
            CONNECTED: '실시간 연결',
            RECONNECTING: '실시간 재연결',
            DISCONNECTED: 'REST 조회',
        })[connectionState.value],
)

const loadSnapshot = async () => {
    loading.value = true
    try {
        const response = await getTypedMonitoring(props.kind)
        snapshot.value = response.data
        if (!selectedMapId.value || !response.data?.maps.some(map => map.id === selectedMapId.value)) {
            selectedMapId.value =
                response.data?.maps.find(map => map.robots.length)?.id ?? response.data?.maps[0]?.id ?? null
        }
    } catch {
        ElNotification.error({
            title: '모니터링 정보 조회 실패',
            message: `${props.title} 정보를 불러오지 못했습니다.`,
        })
    } finally {
        loading.value = false
    }
}

const applyRealtimeDelta = (delta: RobotRealtimeDelta) => {
    if (!snapshot.value) return
    const result = mergeRobotRealtimeDelta(snapshot.value, props.kind, delta)
    if (result.needsResync) {
        void loadSnapshot()
        return
    }
    snapshot.value = result.snapshot
}

const realtimeClient = new RealtimeClient({
    onSnapshot: (value: RealtimeSnapshot) => {
        applyRealtimeDelta({ robots: value.robots, generatedAt: value.generatedAt })
    },
    onDelta: value => {
        applyRealtimeDelta(value as RobotRealtimeDelta)
    },
    onConnectionState: state => {
        connectionState.value = state
        if (state === 'CONNECTED') {
            realtimeNotificationShown.value = false
        }
    },
    onError: () => {
        if (realtimeNotificationShown.value) {
            return
        }
        realtimeNotificationShown.value = true
        ElNotification.info({
            title: '실시간 연결 복구 중',
            message: '현재 위치는 마지막 REST/실시간 수신 값입니다.',
        })
    },
})

const markerTransform = (robot: MonitoringRobot) => {
    if (!selectedMap.value) return 'translate(0 0)'
    const point = worldToPixel({ x: robot.x, y: robot.y }, selectedMap.value)
    return `translate(${point.pixel_x} ${point.pixel_y})`
}
const markerColor = (status: CommunicationStatus) =>
    ({ ONLINE: '#22c55e', STALE: '#f59e0b', OFFLINE: '#ef4444' })[status]
const communicationLabel = (status: CommunicationStatus) =>
    ({ ONLINE: '정상', STALE: '통신 지연', OFFLINE: '오프라인' })[status]
const statusTag = (status: CommunicationStatus) =>
    (({ ONLINE: 'success', STALE: 'warning', OFFLINE: 'danger' }) as const)[status]
const statusLabel = (status?: string | null) => {
    if (!status) return '알 수 없음'
    const statusMap: Record<string, string> = {
        ONLINE: '온라인',
        RUNNING: '작업 중',
        CHARGING: '충전 중',
        PAUSED: '일시정지',
        STOPPED: '안전 정지',
        ERROR: '오류',
        STALE: '통신 지연',
        OFFLINE: '오프라인',
    }
    return statusMap[status] ?? status
}
const formatLastSeen = (value?: string | null) => formatDateTime(value ?? null, '수신 기록 없음')
const selectRobot = (robot: MonitoringRobot) => {
    selectedRobotId.value = robot.id
    selectedMapId.value = robot.mapId
}

const resetCommandResult = () => {
    commandResult.value = null
    commandForm.safeStopConfirmed = false
}

const openControlDialog = () => {
    if (!selectedRobot.value || selectedRobot.value.communicationStatus === 'OFFLINE') return
    Object.assign(commandForm, {
        commandType: 'MOVE_TO',
        x: selectedRobot.value.x,
        y: selectedRobot.value.y,
        mode: 'AUTO',
        missionId: 1,
        reason: '',
        safeStopConfirmed: false,
    })
    commandResult.value = null
    controlDialogVisible.value = true
}

const createIdempotencyKey = () =>
    globalThis.crypto?.randomUUID?.() ?? `robot-command-${Date.now()}-${Math.random().toString(16).slice(2)}`

const commandPayload = (): Record<string, unknown> => {
    if (commandForm.commandType === 'MOVE_TO') return { x: commandForm.x, y: commandForm.y }
    if (commandForm.commandType === 'SET_MODE') return { mode: commandForm.mode }
    if (commandForm.commandType === 'START_MISSION') return { missionId: commandForm.missionId }
    return { reason: commandForm.reason.trim() }
}

const submitCommand = async () => {
    if (!selectedRobot.value) return
    if (commandForm.commandType === 'SAFE_STOP') {
        if (!commandForm.safeStopConfirmed) {
            ElMessage.warning('Safe Stop 확인 항목에 동의하세요.')
            return
        }
        try {
            await ElMessageBox.confirm(
                `${selectedRobot.value.name}에 Safe Stop을 접수하시겠습니까?`,
                'Safe Stop 최종 확인',
                {
                    type: 'error',
                    confirmButtonText: 'Safe Stop 접수',
                    cancelButtonText: '취소',
                },
            )
        } catch {
            return
        }
    }
    commandSaving.value = true
    commandResult.value = null
    try {
        const response = await sendRobotCommand(
            selectedRobot.value.id,
            {
                commandType: commandForm.commandType,
                payload: commandPayload(),
                safeStopConfirmed: commandForm.commandType === 'SAFE_STOP' && commandForm.safeStopConfirmed,
            },
            createIdempotencyKey(),
        )
        commandResult.value = response.data
        ElMessage.success('명령이 접수됐습니다. 실제 상태 변화를 실시간 화면에서 확인하세요.')
    } catch {
        ElMessage.error('명령 접수에 실패했습니다. 권한·통신 상태·입력값을 확인하세요.')
    } finally {
        commandSaving.value = false
    }
}

const commandStatusLabel = (status: RobotCommandStatus) =>
    ({ ACCEPTED: '접수됨', APPLIED: '적용됨', REJECTED: '거부됨' })[status]

watch(selectedMapId, () => {
    imageFailed.value = false
})
watch(selectedMapImageUrl, () => {
    imageFailed.value = false
})
watch(imageLoadFailed, failed => {
    imageFailed.value = failed
})
watch(hasCommunicationIssue, (hasIssue, hadIssue) => {
    if (hasIssue && !hadIssue) {
        ElNotification.warning({
            title: '로봇 통신 상태 확인',
            message: '통신 지연 또는 오프라인 로봇이 있습니다. 마지막 수신 시각을 확인하세요.',
        })
    }
})
onMounted(async () => {
    await loadSnapshot()
    realtimeClient.start()
})
onBeforeUnmount(() => realtimeClient.stop())
</script>

<style scoped lang="scss">
.typed-monitoring {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

.typed-monitoring__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
}

.typed-monitoring__metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border: 1px solid var(--common-component-border-color);
    border-radius: 8px;
    background: var(--common-component-bg-color);
}

.typed-monitoring__metric span,
.typed-monitoring__robot span {
    color: var(--text-color--secondary);
}

.typed-monitoring__metric strong {
    font-size: 24px;
}

.typed-monitoring__metric strong.is-online {
    color: #22c55e;
}
.typed-monitoring__metric strong.is-stale {
    color: #f59e0b;
}
.typed-monitoring__metric strong.is-offline {
    color: #ef4444;
}

.typed-monitoring__content {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 12px;
    min-height: 0;
}

.typed-monitoring__robot-count {
    color: var(--text-color--secondary);
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
}

.typed-monitoring__map-panel,
.typed-monitoring__list-panel {
    min-height: 620px;
}

.typed-monitoring__map-select {
    width: 200px;
}

.typed-monitoring__map-wrap {
    display: flex;
    flex: 1;
    overflow: hidden;
    border-radius: 8px;
    background: #101827;
}

.typed-monitoring__map {
    width: 100%;
    min-height: 540px;
}

.typed-monitoring__marker {
    cursor: pointer;
}

.typed-monitoring__marker-name,
.typed-monitoring__marker-state {
    paint-order: stroke;
    stroke: #0f172a;
    stroke-width: 5px;
    fill: #fff;
    font-size: 18px;
    font-weight: 700;
}

.typed-monitoring__marker-state {
    fill: #cbd5e1;
    font-size: 15px;
    font-weight: 500;
}

.typed-monitoring__robot {
    display: flex;
    flex-direction: column;
    gap: 7px;
    width: 100%;
    padding: 13px;
    margin-bottom: 9px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-color--primary);
    text-align: left;
    background: rgba(255, 255, 255, 0.035);
    cursor: pointer;
}

.typed-monitoring__robot:hover,
.typed-monitoring__robot.is-selected {
    border-color: var(--secondary-color);
    background: rgba(129, 92, 246, 0.1);
}

.typed-monitoring__robot-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.typed-monitoring__control-state {
    margin-top: 8px;
}

.typed-monitoring__control-button,
.typed-monitoring__read-only {
    margin-top: auto;
}

.typed-monitoring__control-button {
    width: 100%;
}

.typed-monitoring__read-only {
    align-self: flex-start;
}

.typed-monitoring__command-notice,
.typed-monitoring__safe-stop-warning,
.typed-monitoring__command-result {
    margin-bottom: 16px;
}

.typed-monitoring__form-control {
    width: 100%;
}

.typed-monitoring__form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 18px;
}

.typed-monitoring__loading {
    padding: 18px;
}
</style>
