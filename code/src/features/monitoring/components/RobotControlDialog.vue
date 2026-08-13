<template>
    <BaseDialog
        :model-value="visible"
        @update:model-value="$emit('update:visible', $event)"
        class="upgraded-control-dialog"
        :title="`${robot?.name ?? '로봇'} 수동 원격 제어 & 관제 대시보드`"
        width="1140px"
    >
        <!-- 1. [Panel 1] 로봇 실시간 텔레메트리 헤더 패널 -->
        <Panel v-if="robot" class="telemetry-header-panel">
            <div class="telemetry-info-group">
                <div class="robot-name-title">
                    <span class="robot-type-chip" :class="robot.robotType.toLowerCase()">
                        {{ robot.robotType === 'WORK' ? '작업용' : '감시용' }}
                    </span>
                    <strong class="robot-name-text">{{ robot.name }}</strong>
                    <span class="robot-id-tag">(ID: {{ robot.id }})</span>
                </div>
                <div class="telemetry-badges">
                    <StatusBadge :label="stateLabel(robot.status || 'RUNNING')" :variant="stateVariant(robot.status || 'RUNNING')" />
                    <span class="comm-status-chip" :class="robot.communicationStatus.toLowerCase()">
                        <span class="status-dot"></span>
                        {{ robot.communicationStatus }}
                    </span>
                    <span class="battery-chip">
                        <Battery :size="15" class="bat-icon" />
                        <strong class="bat-val">{{ robot.batteryPercent }}%</strong>
                    </span>
                    <span class="location-chip">
                        <MapPin :size="14" class="loc-icon" />
                        X: <strong class="coord-val">{{ robot.x.toFixed(2) }}</strong>m, Y: <strong class="coord-val">{{ robot.y.toFixed(2) }}</strong>m
                    </span>
                </div>
            </div>
        </Panel>

        <!-- 한 화면에 통합된 2D 지도 + 지정 제어 + 원격 조종 대시보드 Flex 레이아웃 -->
        <div class="unified-control-flex">
            <!-- 2. [Panel 2] 좌측 2D 인터랙티브 실시간 지도 패널 -->
            <Panel :title="`지도: ${currentMap?.name || '관제 2D 지도'}`" class="mini-map-panel">
                <template #headerRight>
                    <button type="button" class="zoom-reset-btn" @click="resetMapZoom">
                        <RotateCcw :size="13" /> Zoom 초기화
                    </button>
                </template>

                <div class="map-interactive-container" @click="handleMapClick">
                    <svg class="dialog-map-svg" :viewBox="mapViewBox" role="img">
                        <defs>
                            <pattern id="mini-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" />
                            </pattern>
                        </defs>

                        <!-- Background & Map Image -->
                        <rect x="-1000" y="-1000" width="4000" height="4000" fill="#060911" />
                        <image
                            v-if="mapImageSource && !mapImageFailed"
                            :href="mapImageSource"
                            x="0"
                            y="0"
                            :width="mapWidth"
                            :height="mapHeight"
                            preserveAspectRatio="none"
                            opacity="0.95"
                            @error="mapImageFailed = true"
                        />
                        <rect x="-1000" y="-1000" width="4000" height="4000" fill="url(#mini-map-grid)" opacity="0.5" />

                        <!-- POI Markers -->
                        <g
                            v-for="poi in filteredDestinations"
                            :key="`poi-${poi.id}`"
                            class="poi-marker"
                            :transform="poiTransform(poi)"
                            @click.stop="selectPoiDestination(poi)"
                        >
                            <circle r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
                            <text x="9" y="3" class="poi-label">{{ poi.name }}</text>
                        </g>

                        <!-- Current Robot Marker (Pulsing Aura & Heading Arrow) -->
                        <g v-if="robot" class="robot-marker" :transform="robotMarkerTransform">
                            <circle class="pulse-aura" r="22" stroke="#4ade80" />
                            <circle r="12" fill="#22c55e" stroke="#ffffff" stroke-width="2" />
                            <path d="M 0 -8 L 4 3 L 0 0 L -4 3 Z" fill="#ffffff" :transform="`rotate(${robot.heading || 0})`" />
                            <text x="16" y="4" class="robot-map-name">{{ robot.name }} (현재)</text>
                        </g>

                        <!-- Target Destination Click Marker (Crosshair) -->
                        <g v-if="executionUnit === 'DESTINATION'" class="target-click-marker" :transform="targetMarkerTransform">
                            <circle class="target-ring" r="16" stroke="#ef4444" stroke-width="2" fill="none" />
                            <line x1="-12" y1="0" x2="12" y2="0" stroke="#ef4444" stroke-width="2" />
                            <line x1="0" y1="-12" x2="0" y2="12" stroke="#ef4444" stroke-width="2" />
                            <text x="14" y="-8" class="target-coord-text">목표: ({{ commandForm.x }}, {{ commandForm.y }})</text>
                        </g>
                    </svg>
                </div>
                <div class="map-hint-footer">
                    <strong>지도를 마우스로 클릭</strong>하면 해당 위치로 목표 좌표(X, Y)가 자동 설정되며, 수동 조종 시에도 실시간 위치 변화를 직접 관제할 수 있습니다.
                </div>
            </Panel>

            <!-- [우측] 상하 분할 통합 제어 패널 스택 -->
            <div class="right-control-panel-stack">
                <!-- 3. [Panel 3] 우측 상단 지정 명령 및 미션/Task 제어 패널 -->
                <Panel title="지정 명령 및 미션/Task 제어" class="top-unit-panel">
                    <template #headerRight>
                        <button type="button" class="single-estop-trigger-btn" @click="triggerEStopClick">
                            개별 E-STOP (비상정지)
                        </button>
                    </template>

                    <el-form label-position="top" class="custom-control-form">
                        <!-- 4가지 제어 실행 단위 선택 버튼 -->
                        <el-form-item label="수동 제어 실행 단위 선택" required>
                            <RadioToggleGroup
                                v-model="executionUnit"
                                :options="[
                                    { label: '목적지 (POI)', value: 'DESTINATION' },
                                    { label: 'Activity', value: 'ACTIVITY' },
                                    { label: 'Task', value: 'TASK' },
                                    { label: 'Mission', value: 'MISSION' },
                                ]"
                            />
                        </el-form-item>

                        <!-- 단위별 폼 콘텐츠 영역 (고정 최소 높이로 상하 이동 현상 방지) -->
                        <div class="unit-form-content-area">
                            <!-- 1. DESTINATION (목적지 POI & X/Y 좌표) -->
                            <template v-if="executionUnit === 'DESTINATION'">
                                <el-form-item label="등록 목적지 (POI) 선택">
                                    <el-select
                                        v-model="selectedDestinationId"
                                        placeholder="POI 선택 시 좌표 자동 입력"
                                        style="width: 100%"
                                        clearable
                                        @change="handleDestinationChange"
                                    >
                                        <el-option
                                            v-for="dest in filteredDestinations"
                                            :key="dest.id"
                                            :label="`[${dest.type}] ${dest.name} (${dest.mapName})`"
                                            :value="dest.id"
                                        />
                                    </el-select>
                                </el-form-item>
                                <div class="flex-2col">
                                    <el-form-item label="목적지 X 좌표 (m)" required>
                                        <el-input-number v-model="commandForm.x" :precision="2" style="width:100%" />
                                    </el-form-item>
                                    <el-form-item label="목적지 Y 좌표 (m)" required>
                                        <el-input-number v-model="commandForm.y" :precision="2" style="width:100%" />
                                    </el-form-item>
                                </div>
                            </template>

                            <!-- 2. ACTIVITY (단위 작업 선택) -->
                            <el-form-item v-else-if="executionUnit === 'ACTIVITY'" label="실행할 Activity 선택" required>
                                <el-select v-model="selectedActivityId" placeholder="Activity 선택" style="width: 100%">
                                    <el-option
                                        v-for="act in activities"
                                        :key="act.id"
                                        :label="`[${act.code}] ${act.name} (${act.activityType})`"
                                        :value="act.id"
                                    />
                                </el-select>
                            </el-form-item>

                            <!-- 3. TASK (작업 시퀀스 선택) -->
                            <el-form-item v-else-if="executionUnit === 'TASK'" label="실행할 Task 선택" required>
                                <el-select v-model="selectedTaskId" placeholder="Task 선택" style="width: 100%">
                                    <el-option
                                        v-for="task in tasks"
                                        :key="task.id"
                                        :label="`[${task.code}] ${task.name} (${task.robotModelName})`"
                                        :value="task.id"
                                    />
                                </el-select>
                            </el-form-item>

                            <!-- 4. MISSION (복합 융합 미션 선택) -->
                            <el-form-item v-else-if="executionUnit === 'MISSION'" label="실행할 Mission 선택" required>
                                <el-select v-model="commandForm.missionId" placeholder="Mission 선택" style="width: 100%">
                                    <el-option
                                        v-for="mis in missions"
                                        :key="mis.id"
                                        :label="`[${mis.code}] ${mis.name}`"
                                        :value="mis.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </div>
                    </el-form>
                </Panel>

                <!-- 4. [Panel 4] 우측 하단 원격 미세 조종 (Teleop Jog Control) 패널 (헤더 위치 및 간격 최적화) -->
                <Panel
                    title="원격 미세 조종 (Teleop Jog)"
                    subtitle="실시간 위치 관제 및 모션 제어"
                    subtitle-position="right"
                    class="teleop-panel"
                >
                    <div class="teleop-inline-layout">
                        <!-- D-Pad 4방향 조종 버튼 패널 -->
                        <div class="dpad-compact-flex">
                            <div class="dpad-row">
                                <div class="jog-placeholder"></div>
                                <button type="button" class="jog-btn jog-up" title="전진" @click="sendJogCommand('FORWARD')">▲</button>
                                <div class="jog-placeholder"></div>
                            </div>
                            <div class="dpad-row">
                                <button type="button" class="jog-btn jog-left" title="좌회전" @click="sendJogCommand('TURN_LEFT')">◀</button>
                                <button type="button" class="jog-btn jog-stop" title="긴급 정지" @click="sendJogCommand('STOP')">■</button>
                                <button type="button" class="jog-btn jog-right" title="우회전" @click="sendJogCommand('TURN_RIGHT')">▶</button>
                            </div>
                            <div class="dpad-row">
                                <div class="jog-placeholder"></div>
                                <button type="button" class="jog-btn jog-down" title="후진" @click="sendJogCommand('BACKWARD')">▼</button>
                                <div class="jog-placeholder"></div>
                            </div>
                        </div>

                        <!-- 우측: 원본 기본 슬라이더 및 시원하게 확장된 터미널 로그 스트림 -->
                        <div class="teleop-compact-controls">
                            <div class="speed-slider-row">
                                <span class="speed-lbl">조종 속도: <strong class="speed-val">{{ jogSpeed.toFixed(1) }}</strong> m/s</span>
                                <el-slider v-model="jogSpeed" :min="0.1" :max="2.0" :step="0.1" style="flex:1" />
                            </div>

                            <!-- 높이가 확장된 터미널 콘솔 로그 뷰어 -->
                            <div class="jog-terminal-box">
                                <div class="terminal-header">
                                    <span class="term-left">
                                        <span class="term-dot green"></span>
                                        <span class="term-prompt">$</span>
                                        <span class="term-title">teleop.log -- stream</span>
                                    </span>
                                    <button v-if="jogLogs.length > 0" type="button" class="clear-logs-btn" @click="jogLogs = []">
                                        초기화
                                    </button>
                                </div>
                                <div class="terminal-body" ref="jogLogContainer">
                                    <div v-if="jogLogs.length === 0" class="log-empty">
                                        > Awaiting Teleop Jog commands... Click (▲ ◀ ■ ▶ ▼)
                                    </div>
                                    <div
                                        v-for="log in jogLogs"
                                        :key="log.id"
                                        class="log-line"
                                        :class="{ 'is-stop': log.action === 'STOP' }"
                                    >
                                        <span class="log-prompt">></span>
                                        <span class="log-time">[{{ log.time }}]</span>
                                        <span class="log-action">{{ log.actionName }}</span>
                                        <span class="log-speed">{{ log.speed.toFixed(1) }}m/s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>

        <template #footer>
            <el-button @click="$emit('update:visible', false)">취소</el-button>
            <el-button
                type="primary"
                :loading="saving"
                @click="handleCommandSubmit"
            >
                명령 집행
            </el-button>
        </template>

        <!-- 5. 비상정지(E-STOP) / 중요 모드 비밀번호 확인 다이얼로그 (비상정지 안내문 포함) -->
        <BaseDialog
            v-model="passwordConfirmVisible"
            :title="isEstopConfirm ? '개별 비상정지 (E-STOP) 집행 확인' : '제어 명령 전송 비밀번호 재확인'"
            :description="isEstopConfirm ? '안전 조치를 위해 로봇 비상정지 집행 전 계정 비밀번호를 확인합니다.' : '안전한 로봇 제어 명령 집행을 위해 현재 로그인된 계정 비밀번호를 입력하세요.'"
            width="460px"
        >
            <el-form label-position="top">
                <!-- 비상정지 선택 시 안내문 표시 -->
                <div v-if="isEstopConfirm" class="estop-modal-warning-box">
                    <strong>개별 비상정지(E-Stop) 집행 시</strong> 해당 로봇의 구동 모터가 즉시 록킹(Locking)되며 진행 중인 모든 대기 및 실행 작업이 즉시 중단됩니다.
                </div>

                <el-form-item label="비밀번호 입력" required>
                    <el-input
                        v-model="confirmPassword"
                        type="password"
                        placeholder="비밀번호 입력 (예: admin123)"
                        show-password
                        @keyup.enter="confirmAndSubmit"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="passwordConfirmVisible = false">취소</el-button>
                <el-button
                    :type="isEstopConfirm ? 'danger' : 'primary'"
                    :loading="saving"
                    @click="confirmAndSubmit"
                >
                    {{ isEstopConfirm ? 'E-STOP 비상집행 확인' : '명령 집행 확인' }}
                </el-button>
            </template>
        </BaseDialog>
    </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import RadioToggleGroup from '@/components/RadioToggleGroup.vue'
import { RotateCcw, Battery, MapPin } from '@lucide/vue'
import { simulationService } from '@/services/simulation.service'
import type { MonitoringRobot } from '../service/integrated/integratedMonitoring.types'
import { fetchMockDestinations } from '@/pages/main/admin/destinations/service/destinations.mock'
import type { DestinationItem } from '@/pages/main/admin/destinations/service/destinations.types'
import { getActivities, getTasks, getMissions } from '@/pages/main/admin/missions/service/missionManagement.api'
import type { ActivityItem, TaskItem, MissionItem } from '@/pages/main/admin/missions/service/missionManagement.types'
import { fetchMockMaps } from '@/pages/main/admin/maps/service/maps.mock'
import type { MapItem } from '@/pages/main/admin/maps/service/maps.types'
import { useAuthenticatedMapImage } from '@/composables/useAuthenticatedMapImage'
import { worldToPixel, pixelToWorld } from '@/utils/mapCoordinates'

type StandardControlExecutionUnit = 'DESTINATION' | 'ACTIVITY' | 'TASK' | 'MISSION'

interface JogLogItem {
    id: number
    time: string
    action: string
    actionName: string
    speed: number
}

const props = defineProps<{
    visible: boolean
    robot: MonitoringRobot | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void
}>()

const saving = ref(false)
const executionUnit = ref<StandardControlExecutionUnit>('DESTINATION')

const destinations = ref<DestinationItem[]>([])
const maps = ref<MapItem[]>([])
const activities = ref<ActivityItem[]>([])
const tasks = ref<TaskItem[]>([])
const missions = ref<MissionItem[]>([])

const selectedDestinationId = ref<number | null>(null)
const selectedActivityId = ref<number | null>(null)
const selectedTaskId = ref<number | null>(null)

const passwordConfirmVisible = ref(false)
const isEstopConfirm = ref(false)
const confirmPassword = ref('')

const jogSpeed = ref(0.5)
const jogLogs = ref<JogLogItem[]>([])
const jogLogContainer = ref<HTMLElement | null>(null)

const mapImageFailed = ref(false)

const commandForm = reactive({
    x: 15.0,
    y: 10.0,
    siteX: undefined as number | undefined,
    siteY: undefined as number | undefined,
    missionId: 1,
})

const currentMap = computed(() => {
    if (!props.robot) return maps.value[0] ?? null
    return maps.value.find(m => m.id === props.robot?.mapId) ?? maps.value[0] ?? null
})

const mapWidth = computed(() => currentMap.value?.width || 1400)
const mapHeight = computed(() => currentMap.value?.height || 800)
const mapImageUrl = computed(() => currentMap.value?.imageUrl || '')
const { imageSource: mapImageSource } = useAuthenticatedMapImage(mapImageUrl)

const mapViewBox = computed(() => `0 0 ${mapWidth.value} ${mapHeight.value}`)

const filteredDestinations = computed(() => {
    if (!props.robot) return destinations.value
    return destinations.value.filter(d => {
        if (!d.targetRobotType || d.targetRobotType === 'ALL') return true
        return d.targetRobotType === props.robot?.robotType
    })
})

const stateLabel = (status: string) => {
    switch (status) {
        case 'IDLE': return '대기 중 (IDLE)'
        case 'RUNNING': return '작업 중 (RUNNING)'
        case 'PAUSED': return '일시정지 (PAUSED)'
        case 'ERROR': return '오류 발생 (ERROR)'
        default: return status
    }
}

const stateVariant = (status: string) => {
    switch (status) {
        case 'RUNNING': return 'success'
        case 'IDLE': return 'info'
        case 'PAUSED': return 'warning'
        case 'ERROR': return 'danger'
        default: return 'info'
    }
}

const loadData = async () => {
    destinations.value = await fetchMockDestinations()
    maps.value = await fetchMockMaps()
    const [actRes, taskRes, misRes] = await Promise.all([getActivities(), getTasks(), getMissions()])
    activities.value = actRes.data ?? []
    tasks.value = taskRes.data ?? []
    missions.value = misRes.data ?? []

    if (activities.value.length > 0) selectedActivityId.value = activities.value[0].id
    if (tasks.value.length > 0) selectedTaskId.value = tasks.value[0].id
    if (missions.value.length > 0) commandForm.missionId = missions.value[0].id
}

onMounted(() => {
    void loadData()
})

watch(() => props.visible, (val) => {
    if (val) {
        void loadData()
        if (props.robot) {
            commandForm.x = Number(props.robot.x.toFixed(2))
            commandForm.y = Number(props.robot.y.toFixed(2))
            commandForm.siteX = props.robot.siteX
            commandForm.siteY = props.robot.siteY
        }
    }
})

// Map click to target coordinate conversion
const handleMapClick = (e: MouseEvent) => {
    if (executionUnit.value !== 'DESTINATION') return
    const container = (e.currentTarget as HTMLElement).querySelector('.dialog-map-svg')
    if (!container || !currentMap.value) return

    const rect = container.getBoundingClientRect()
    const clickPixelX = (e.clientX - rect.left) * (mapWidth.value / rect.width)
    const clickPixelY = (e.clientY - rect.top) * (mapHeight.value / rect.height)

    const metadata = {
        width: currentMap.value.width,
        height: currentMap.value.height,
        resolution: currentMap.value.resolution || 0.05,
        origin_x: currentMap.value.originX ?? currentMap.value.origin_x ?? 0,
        origin_y: currentMap.value.originY ?? currentMap.value.origin_y ?? 0,
    }

    const worldPoint = pixelToWorld({ pixel_x: clickPixelX, pixel_y: clickPixelY }, metadata)
    commandForm.x = Number(worldPoint.x.toFixed(2))
    commandForm.y = Number(worldPoint.y.toFixed(2))
    selectedDestinationId.value = null
    ElMessage.info(`지도 클릭: 목표 좌표 (X: ${commandForm.x}m, Y: ${commandForm.y}m) 설정 완료`)
}

const resetMapZoom = () => {
    ElMessage.success('지도 뷰어가 초기화되었습니다.')
}

const robotMarkerTransform = computed(() => {
    if (!props.robot || !currentMap.value) return 'translate(0, 0)'
    const metadata = {
        width: currentMap.value.width,
        height: currentMap.value.height,
        resolution: currentMap.value.resolution || 0.05,
        origin_x: currentMap.value.originX ?? currentMap.value.origin_x ?? 0,
        origin_y: currentMap.value.originY ?? currentMap.value.origin_y ?? 0,
    }
    const pixel = worldToPixel({ x: props.robot.x, y: props.robot.y }, metadata)
    return `translate(${pixel.pixel_x}, ${pixel.pixel_y})`
})

const targetMarkerTransform = computed(() => {
    if (!currentMap.value) return 'translate(0, 0)'
    const metadata = {
        width: currentMap.value.width,
        height: currentMap.value.height,
        resolution: currentMap.value.resolution || 0.05,
        origin_x: currentMap.value.originX ?? currentMap.value.origin_x ?? 0,
        origin_y: currentMap.value.originY ?? currentMap.value.origin_y ?? 0,
    }
    const pixel = worldToPixel({ x: commandForm.x, y: commandForm.y }, metadata)
    return `translate(${pixel.pixel_x}, ${pixel.pixel_y})`
})

const poiTransform = (poi: DestinationItem) => {
    if (!currentMap.value) return 'translate(0, 0)'
    const metadata = {
        width: currentMap.value.width,
        height: currentMap.value.height,
        resolution: currentMap.value.resolution || 0.05,
        origin_x: currentMap.value.originX ?? currentMap.value.origin_x ?? 0,
        origin_y: currentMap.value.originY ?? currentMap.value.origin_y ?? 0,
    }
    const pixel = worldToPixel({ x: poi.x, y: poi.y }, metadata)
    return `translate(${pixel.pixel_x}, ${pixel.pixel_y})`
}

const selectPoiDestination = (poi: DestinationItem) => {
    selectedDestinationId.value = poi.id
    commandForm.x = poi.x
    commandForm.y = poi.y
    commandForm.siteX = poi.siteX
    commandForm.siteY = poi.siteY
    ElMessage.info(`목적지 '${poi.name}' 선택 완료`)
}

const handleDestinationChange = (destId: number | null) => {
    if (!destId) return
    const target = destinations.value.find(d => d.id === destId)
    if (target) {
        selectPoiDestination(target)
    }
}

const getActionName = (action: string) => {
    switch (action) {
        case 'FORWARD': return '전진 (FORWARD)'
        case 'BACKWARD': return '후진 (BACKWARD)'
        case 'TURN_LEFT': return '좌회전 (TURN_LEFT)'
        case 'TURN_RIGHT': return '우회전 (TURN_RIGHT)'
        case 'STOP': return '긴급 정지 (STOP)'
        default: return action
    }
}

const sendJogCommand = (action: string) => {
    if (!props.robot) return
    const nowStr = new Date().toLocaleTimeString()
    
    jogLogs.value.push({
        id: Date.now() + Math.random(),
        time: nowStr,
        action,
        actionName: getActionName(action),
        speed: jogSpeed.value,
    })

    if (jogLogs.value.length > 30) {
        jogLogs.value.shift()
    }

    void nextTick(() => {
        if (jogLogContainer.value) {
            jogLogContainer.value.scrollTop = jogLogContainer.value.scrollHeight
        }
    })

    simulationService.applyCommand(props.robot.id, 'MOVE_TO', {
        x: props.robot.x + (action === 'FORWARD' ? 0.5 : action === 'BACKWARD' ? -0.5 : 0),
        y: props.robot.y + (action === 'TURN_RIGHT' ? 0.5 : action === 'TURN_LEFT' ? -0.5 : 0),
    })
    // Toast message popup removed as requested by user!
}

const triggerEStopClick = () => {
    isEstopConfirm.value = true
    passwordConfirmVisible.value = true
}

const handleCommandSubmit = () => {
    if (!props.robot) return
    executeCommand()
}

const confirmAndSubmit = () => {
    if (!confirmPassword.value) {
        ElMessage.warning('비밀번호를 입력해 주세요.')
        return
    }
    const isEstop = isEstopConfirm.value
    passwordConfirmVisible.value = false
    confirmPassword.value = ''
    
    if (isEstop) {
        executeEStop()
    } else {
        executeCommand()
    }
}

const executeEStop = () => {
    if (!props.robot) return
    saving.value = true
    try {
        simulationService.applyCommand(props.robot.id, 'E_STOP', { reason: '수동 원격 비상정지 집행' })
        ElMessage.error(`[${props.robot.name}] 개별 E-STOP 비상정지가 전송되었습니다.`)
        emit('update:visible', false)
    } finally {
        saving.value = false
    }
}

const executeCommand = () => {
    if (!props.robot) return
    saving.value = true
    try {
        let cmdType = 'MOVE_TO'
        let payload: Record<string, any> = {}

        switch (executionUnit.value) {
            case 'DESTINATION':
                cmdType = 'MOVE_TO'
                payload = { x: commandForm.x, y: commandForm.y }
                break
            case 'ACTIVITY':
                cmdType = 'EXECUTE_ACTIVITY'
                payload = { activityId: selectedActivityId.value }
                break
            case 'TASK':
                cmdType = 'EXECUTE_TASK'
                payload = { taskId: selectedTaskId.value }
                break
            case 'MISSION':
                cmdType = 'START_MISSION'
                payload = { missionId: commandForm.missionId }
                break
        }

        simulationService.applyCommand(props.robot.id, cmdType, payload)
        ElMessage.success(`[${props.robot.name}] 제어 명령(${executionUnit.value})이 집행되었습니다.`)
        emit('update:visible', false)
    } finally {
        saving.value = false
    }
}
</script>

<style scoped lang="scss">
/* 1. Header Telemetry Bar Panel */
.telemetry-header-panel {
    margin-bottom: 12px;
    padding: 12px 16px;
    background: rgba(15, 23, 42, 0.85);

    .telemetry-info-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
    }

    .robot-name-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;

        .robot-name-text {
            color: #ffffff;
            font-weight: 700;
            font-size: 16px;
        }

        .robot-type-chip {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;

            &.work { background: rgba(59, 130, 246, 0.25); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.5); }
            &.surveillance { background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.5); }
        }

        .robot-id-tag {
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
        }
    }

    .telemetry-badges {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;

        .comm-status-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 12px;

            .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: currentColor;
            }

            &.online { color: #4ade80; background: rgba(74, 222, 128, 0.18); border: 1px solid rgba(74, 222, 128, 0.3); }
            &.stale { color: #facc15; background: rgba(250, 204, 21, 0.18); border: 1px solid rgba(250, 204, 21, 0.3); }
            &.offline { color: #f87171; background: rgba(248, 113, 113, 0.18); border: 1px solid rgba(248, 113, 113, 0.3); }
        }

        .battery-chip, .location-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(30, 41, 59, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 3px 10px;
            border-radius: 4px;
            color: #f1f5f9;

            .bat-icon {
                color: #4ade80;
            }

            .bat-val {
                display: inline-block;
                min-width: 42px;
                text-align: right;
                font-variant-numeric: tabular-nums;
                color: #ffffff;
            }

            .loc-icon {
                color: #38bdf8;
            }

            .coord-val {
                display: inline-block;
                min-width: 65px;
                text-align: right;
                font-variant-numeric: tabular-nums;
                color: #ffffff;
            }

            strong {
                color: #ffffff;
            }
        }
    }
}

/* Flexbox Unified Control Layout */
.unified-control-flex {
    display: flex;
    gap: 16px;

    .mini-map-panel {
        width: 520px;
        flex-shrink: 0;
        padding: 14px;
        background: #060911;

        :deep(.panel__header h2) {
            color: #38bdf8;
            font-size: 14px;
            font-weight: 700;
        }
    }

    .right-control-panel-stack {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
}

/* 2. 2D Interactive Map Container & High Contrast Colors */
.mini-map-panel {
    display: flex;
    flex-direction: column;

    /* Zoom Reset Button Style */
    .zoom-reset-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.35);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(56, 189, 248, 0.25);
            border-color: #38bdf8;
            color: #ffffff;
            box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .map-interactive-container {
        position: relative;
        width: 100%;
        height: 440px;
        cursor: crosshair;
        background: #060911;

        .dialog-map-svg {
            width: 100%;
            height: 100%;
        }

        .poi-marker {
            cursor: pointer;
            &:hover circle { fill: #60a5fa; transform: scale(1.2); }
            .poi-label {
                font-size: 11px;
                fill: #e2e8f0;
                font-weight: 600;
            }
        }

        .robot-marker {
            .pulse-aura {
                animation: mapPulse 2s infinite ease-out;
            }
            .robot-map-name {
                font-size: 12px;
                fill: #4ade80;
                font-weight: bold;
            }
        }

        .target-click-marker {
            .target-ring {
                animation: targetPulse 1.5s infinite alternate;
            }
            .target-coord-text {
                font-size: 12px;
                fill: #f87171;
                font-weight: bold;
            }
        }
    }

    .map-hint-footer {
        padding: 10px 14px;
        font-size: 12px;
        color: #cbd5e1;
        background: rgba(15, 23, 42, 0.9);
        border-top: 1px solid var(--border-glass-color);
        margin-top: 8px;
        border-radius: 4px;

        strong {
            color: #38bdf8;
        }
    }
}

.top-unit-panel {
    padding: 14px 16px;
    background: rgba(15, 23, 42, 0.65);

    :deep(.panel__header h2) {
        color: #38bdf8;
        font-size: 14px;
        font-weight: 700;
    }

    /* Single E-STOP Button Style */
    .single-estop-trigger-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border: 1px solid #f87171;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.35);
        transition: all 0.2s ease;

        &:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
            transform: translateY(-1px);
        }

        &:active {
            transform: scale(0.96);
        }
    }
}

.custom-control-form {
    display: flex;
    flex-direction: column;

    .mode-radio-group {
        width: 100%;
        display: flex;
        :deep(.el-radio-button) {
            flex: 1;
            .el-radio-button__inner { width: 100%; }
        }
    }
    :deep(.el-form-item) {
        margin-bottom: 12px;
    }
}

/* 고정 최소 높이 폼 영역으로 탭 변경 시 Teleop Jog 위치 이동 방지 */
.unit-form-content-area {
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.flex-2col {
    display: flex;
    gap: 12px;

    :deep(.el-form-item) {
        flex: 1;
        margin-bottom: 12px;
    }
}

/* E-Stop Modal Warning Box */
.estop-modal-warning-box {
    background: rgba(239, 68, 68, 0.18);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
}

/* Teleop Panel High-Tech Styling (헤더 간격 및 수직 위치 정돈) */
.teleop-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 14px 16px;
    background: rgba(15, 23, 42, 0.65);

    :deep(.panel__header) {
        margin-bottom: 12px;
    }

    :deep(.panel__heading--bottom) {
        gap: 3px;
    }

    :deep(.panel__heading h2) {
        color: #38bdf8;
        font-size: 14px;
        font-weight: 700;
        margin: 0;
    }

    :deep(.panel__heading span) {
        color: #94a3b8;
        font-size: 12px;
    }

    .teleop-inline-layout {
        display: flex;
        gap: 18px;
        align-items: stretch;
        flex: 1;
    }

    /* D-Pad Futuristic Gamepad Styling */
    .dpad-compact-flex {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        width: 180px;
        flex-shrink: 0;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 12px;
        padding: 8px;
        box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.5);

        .dpad-row {
            display: flex;
            gap: 6px;
            justify-content: center;
        }

        .jog-placeholder {
            width: 44px;
            height: 44px;
        }

        .jog-btn {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 8px;
            color: #38bdf8;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

            &:hover {
                background: rgba(56, 189, 248, 0.25);
                border-color: #38bdf8;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
            }

            &:active {
                transform: scale(0.92);
                background: rgba(56, 189, 248, 0.5);
            }

            &.jog-stop {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.6);
                color: #f87171;
                font-size: 16px;
                box-shadow: 0 0 8px rgba(239, 68, 68, 0.25);

                &:hover {
                    background: rgba(239, 68, 68, 0.4);
                    border-color: #ef4444;
                    color: #ffffff;
                    box-shadow: 0 0 14px rgba(239, 68, 68, 0.6);
                }
            }
        }
    }

    .teleop-compact-controls {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .speed-slider-row {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;

            .speed-lbl {
                white-space: nowrap;
                color: #cbd5e1;

                .speed-val {
                    color: #38bdf8;
                    font-variant-numeric: tabular-nums;
                    display: inline-block;
                    min-width: 32px;
                    text-align: right;
                }
            }
        }

        /* 고도화된 실시간 Terminal 로그 콘솔 스타일 */
        .jog-terminal-box {
            background: #080d1a;
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 140px;
            box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6);

            .terminal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 12px;
                background: rgba(15, 23, 42, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);

                .term-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .term-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    &.green { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
                }

                .term-prompt {
                    color: #38bdf8;
                    font-family: monospace;
                    font-weight: bold;
                    font-size: 11px;
                }

                .term-title {
                    font-size: 11px;
                    color: #94a3b8;
                    font-family: monospace;
                    font-weight: 600;
                }

                .clear-logs-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    padding: 1px 6px;
                    color: #94a3b8;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.15s ease;

                    &:hover {
                        background: rgba(239, 68, 68, 0.2);
                        border-color: rgba(239, 68, 68, 0.5);
                        color: #f87171;
                    }
                }
            }

            .terminal-body {
                flex: 1;
                overflow-y: auto;
                padding: 8px 12px;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 11px;
                line-height: 1.6;

                .log-empty {
                    color: #475569;
                    font-size: 11px;
                }

                .log-line {
                    display: flex;
                    gap: 8px;
                    align-items: center;

                    .log-prompt {
                        color: #475569;
                        font-weight: bold;
                    }

                    .log-time {
                        color: #64748b;
                        font-size: 10px;
                    }

                    .log-action {
                        color: #38bdf8;
                        font-weight: 600;
                    }

                    .log-speed {
                        color: #4ade80;
                        margin-left: auto;
                        font-weight: bold;
                        font-variant-numeric: tabular-nums;
                    }

                    &.is-stop {
                        .log-action {
                            color: #f87171;
                        }
                    }
                }
            }
        }
    }
}

@keyframes mapPulse {
    0% { r: 12px; opacity: 0.8; }
    100% { r: 28px; opacity: 0; }
}

@keyframes targetPulse {
    0% { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(1.2); opacity: 1; }
}
</style>
