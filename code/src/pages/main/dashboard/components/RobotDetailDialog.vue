<template>
    <BaseDialog
        :model-value="visible"
        :title="robot ? `${robot.name} 상세 상태` : '로봇 상세 상태'"
        description="실시간 수신 데이터 기준"
        width="880px"
        max-height="92vh"
        dialog-class="robot-detail-base-dialog common-dialog"
        @update:model-value="$emit('update:visible', $event)"
    >
        <div v-if="robot" class="robot-detail-dialog-body">
            <section class="robot-detail-summary">
                <div class="robot-image-panel">
                    <img v-if="robotImageSrc" :src="robotImageSrc" :alt="`${robot.name} 이미지`" class="robot-image" />
                    <div v-else class="robot-image-placeholder">
                        <Bot :size="74" stroke-width="1.5" />
                        <span>{{ robot.robotType === 'WORK' ? '작업 로봇' : '감시 로봇' }}</span>
                    </div>
                </div>

                <Panel class="robot-summary-info">
                    <div class="robot-summary-main">
                        <div class="robot-identity-block">
                            <span class="robot-code">{{ robot.code || robot.modelCode || `ROBOT-${robot.id}` }}</span>
                            <h3>{{ robot.name }}</h3>
                            <p>{{ robot.modelName || robot.modelCode || '모델 정보 없음' }}</p>
                        </div>
                        <span class="operation-state-badge">{{ operationLabel(robot.status) }}</span>
                    </div>

                    <div class="robot-key-info-grid">
                        <div class="robot-key-info-item">
                            <span>유형</span>
                            <strong>{{ robot.robotType === 'WORK' ? '작업 로봇' : '감시 로봇' }}</strong>
                        </div>
                        <div class="robot-key-info-item">
                            <span>통신상태</span>
                            <strong>{{ communicationLabel(robot.communicationStatus) }}</strong>
                        </div>
                        <div class="robot-key-info-item">
                            <span>구역</span>
                            <strong>{{ areaLabel(robot) }}</strong>
                        </div>
                        <div class="robot-key-info-item">
                            <span>좌표</span>
                            <strong>{{ robot.x.toFixed(1) }}, {{ robot.y.toFixed(1) }}</strong>
                        </div>
                    </div>

                    <div class="robot-mission-summary">
                        <div>
                            <span>진행 중인 미션</span>
                            <strong>{{ mission?.name ?? '배정된 진행 중 미션 없음' }}</strong>
                        </div>
                        <div class="robot-battery-inline">
                            <div class="battery-inline-head">
                                <span>배터리</span>
                                <strong>{{ robot.batteryPercent }}%</strong>
                            </div>
                            <div class="key-battery-track">
                                <i :style="{ width: `${robot.batteryPercent}%` }"></i>
                            </div>
                        </div>
                    </div>
                </Panel>
            </section>

            <section class="robot-dialog-columns">
                <Panel class="robot-detail-section" title="로봇 상세정보">
                    <dl class="robot-detail-grid">
                        <div v-for="item in detailItems" :key="item.label">
                            <dt>{{ item.label }}</dt>
                            <dd>{{ item.value }}</dd>
                        </div>
                    </dl>
                </Panel>

                <Panel class="robot-log-section" title="실시간 수신 로그">
                    <div class="terminal-body">
                        <div v-for="log in activityLogs" :key="log.id" class="terminal-line">
                            <time>{{ log.time }}</time>
                            <span class="terminal-prompt">&gt;</span>
                            <span class="terminal-level" :class="`is-${log.level.toLowerCase()}`">{{ log.level }}</span>
                            <span class="terminal-message">{{ log.message }}</span>
                        </div>
                    </div>
                </Panel>
            </section>
        </div>

        <template #footer>
            <el-button @click="$emit('update:visible', false)">닫기</el-button>
            <el-button type="primary" @click="robot && $emit('openMonitoring', robot)">관제 화면 이동</el-button>
            <el-button
                v-if="robot?.robotType === 'SURVEILLANCE'"
                type="primary"
                plain
                @click="robot && $emit('openCamera', robot)"
            >
                카메라 보기
            </el-button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Bot } from '@lucide/vue'
import BaseDialog from '@/components/BaseDialog.vue'
import Panel from '@/components/Panel.vue'
import { formatDateTime } from '@/utils/date.util'
import type {
    CommunicationStatus,
    MonitoringRobot,
} from '@/features/monitoring/service/integrated/integratedMonitoring.types'

type RobotActivityLog = {
    id: number
    time: string
    level: 'INFO' | 'WARN' | 'ERROR'
    message: string
}

type RunningMissionInfo = {
    id: number
    name: string
    currentStep: string
    robotName: string
    progress: number
    eta: string
    statusLabel: string
}

const props = defineProps<{
    visible: boolean
    robot: MonitoringRobot | null
    mission: RunningMissionInfo | null
}>()

defineEmits<{
    (e: 'update:visible', visible: boolean): void
    (e: 'openMonitoring', robot: MonitoringRobot): void
    (e: 'openCamera', robot: MonitoringRobot): void
}>()

const activityLogs = ref<RobotActivityLog[]>([])
let activityLogId = 0

const robotImageSrc = computed(() => {
    const robot = props.robot as
        | (MonitoringRobot & { imageUrl?: string; imagePath?: string; thumbnailUrl?: string })
        | null
    return robot?.imageUrl || robot?.imagePath || robot?.thumbnailUrl || ''
})

const detailItems = computed(() => {
    if (!props.robot) {
        return []
    }

    const robot = props.robot
    return [
        { label: '유형', value: robot.robotType === 'WORK' ? '작업 로봇' : '감시 로봇' },
        { label: '구역', value: areaLabel(robot) },
        { label: '좌표 X/Y', value: `X ${robot.x.toFixed(2)} / Y ${robot.y.toFixed(2)}` },
        { label: '현장 좌표', value: formatSitePosition(robot) },
        { label: '방향', value: `${robot.heading}°` },
        { label: '배터리', value: `${robot.batteryPercent}%` },
        { label: '통신 상태', value: communicationLabel(robot.communicationStatus) },
        { label: '운행 상태', value: operationLabel(robot.status) },
        { label: '카메라', value: robot.robotType === 'SURVEILLANCE' ? '사용 가능' : '미탑재' },
        { label: '최근 수신', value: robot.lastSeenAt ? formatDateTime(robot.lastSeenAt) : '실시간 수신 중' },
    ]
})

const appendActivityLog = () => {
    if (!props.visible || !props.robot) {
        return
    }

    const robot = props.robot
    const now = new Date()
    const level: RobotActivityLog['level'] =
        robot.communicationStatus === 'OFFLINE' || robot.status === 'ERROR'
            ? 'ERROR'
            : robot.communicationStatus === 'STALE'
              ? 'WARN'
              : 'INFO'

    activityLogs.value = [
        {
            id: activityLogId++,
            time: now.toLocaleTimeString('ko-KR', { hour12: false }),
            level,
            message: `telemetry.update status=${robot.status ?? 'RUNNING'} area="${areaLabel(robot)}" pos=(${robot.x.toFixed(1)},${robot.y.toFixed(1)}) heading=${robot.heading} battery=${robot.batteryPercent}% comm=${robot.communicationStatus}`,
        },
        ...activityLogs.value,
    ].slice(0, 7)
}

watch(
    () => props.visible,
    visible => {
        if (visible) {
            activityLogs.value = []
            appendActivityLog()
            return
        }
        activityLogs.value = []
    },
)

watch(
    () =>
        props.robot
            ? [
                  props.robot.id,
                  props.robot.x,
                  props.robot.y,
                  props.robot.heading,
                  props.robot.batteryPercent,
                  props.robot.status,
                  props.robot.communicationStatus,
                  props.robot.lastSeenAt,
              ].join('|')
            : '',
    () => {
        appendActivityLog()
    },
)

const communicationLabel = (status: CommunicationStatus) =>
    ({ ONLINE: '정상', STALE: '지연', OFFLINE: '오프라인' })[status] ?? '정상'

const communicationVariant = (status: CommunicationStatus) =>
    (({ ONLINE: 'success', STALE: 'warning', OFFLINE: 'danger' }) as const)[status] ?? 'success'

const operationLabel = (status?: string) => {
    const labels: Record<string, string> = {
        RUNNING: '운행 중',
        IDLE: '대기',
        CHARGING: '충전 중',
        ERROR: '오류',
    }
    return labels[status ?? ''] ?? '운행 중'
}

const areaLabel = (robot: MonitoringRobot) => {
    if (robot.mapId === 1) {
        return '대표 지도'
    }
    if (robot.mapId === 2) {
        return '장입 구역'
    }
    if (robot.mapId === 3) {
        return '외곽 순찰'
    }
    return `구역 ${robot.mapId}`
}

const formatSitePosition = (robot: MonitoringRobot) => {
    if (typeof robot.siteX === 'number' && typeof robot.siteY === 'number') {
        return `SX ${robot.siteX.toFixed(2)} / SY ${robot.siteY.toFixed(2)}`
    }
    return '-'
}
</script>

<style scoped lang="scss">
.robot-detail-dialog-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.robot-detail-summary {
    display: flex;
    gap: 12px;
}

.robot-image-panel {
    flex: 0 0 240px;
    min-height: 210px;
    overflow: hidden;
    border: 1px solid var(--panel-border-color);
    border-radius: 8px;
    background: color-mix(in srgb, #151a27 74%, transparent);
}

.robot-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.robot-image-placeholder {
    display: flex;
    height: 100%;
    min-height: 210px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--secondary-color);
    background: radial-gradient(
            circle at 50% 28%,
            color-mix(in srgb, var(--primary-color) 22%, transparent),
            transparent 38%
        ),
        linear-gradient(145deg, color-mix(in srgb, var(--primary-color) 16%, #101521), #07111d 68%);

    span {
        color: var(--text-color--primary);
        font-size: 14px;
        font-weight: 800;
    }
}

.robot-summary-info {
    flex: 1 1 auto;

    :deep(.panel__body) {
        gap: 12px;
    }
}

.robot-summary-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 0;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid color-mix(in srgb, #ffffff 8%, transparent);

    h3 {
        margin: 4px 0 0;
        color: var(--text-color--primary);
        font-size: 23px;
        line-height: 1.2;
    }

    p {
        margin: 6px 0 0;
        color: var(--text-color--secondary);
        font-size: 13px;
        font-weight: 700;
    }
}

.robot-identity-block {
    min-width: 0;
}

.operation-state-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 64px;
    height: 26px;
    padding: 0 12px;
    border: 1px solid color-mix(in srgb, var(--info-color) 42%, transparent);
    border-radius: 999px;
    color: var(--info-color);
    background: color-mix(in srgb, var(--info-color) 10%, transparent);
    font-size: 12px;
    font-weight: 800;
}

.robot-code {
    color: var(--text-color--secondary);
    font-size: 12px;
    font-weight: 700;
}

.robot-key-info-grid {
    display: flex;
    gap: 8px;
    padding-top: 0;
}

.robot-key-info-item,
.robot-battery-inline,
.robot-mission-summary {
    min-width: 0;

    span,
    strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    span {
        margin-bottom: 5px;
        color: var(--text-color--secondary);
        font-size: 11px;
        font-weight: 700;
    }

    strong {
        color: var(--text-color--primary);
        font-size: 18px;
        line-height: 1.15;
        font-weight: 600;
    }
}

.robot-key-info-item {
    flex: 1;
    border-radius: 8px;
    min-height: 58px;
    padding: 11px 12px;
    background: color-mix(in srgb, #ffffff 6%, transparent);
}

.robot-battery-inline {
    width: 23.8%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;

    strong {
        color: var(--secondary-color);
        font-size: 28px;
        line-height: 1.1;
    }
}

.battery-inline-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
}

.key-battery-track {
    height: 6px;
    width: 100%;
    margin-top: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: color-mix(in srgb, #000000 38%, transparent);

    i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--secondary-color), var(--info-color));
    }
}

.robot-mission-summary {
    display: flex;
    gap: 8px;
    align-items: stretch;

    > div {
        min-width: 0;
        min-height: 58px;
        border-radius: 8px;
        padding: 11px 12px;
        background: color-mix(in srgb, #ffffff 6%, transparent);
    }

    > div:first-child {
        flex: 1 1 auto;
    }

    strong {
        font-size: 16px;
        line-height: 1.25;
    }
}

.robot-dialog-columns {
    display: flex;
    gap: 12px;
}

.robot-detail-section {
    flex: 0.95 1 0;
    min-width: 0;

    :deep(.panel__header) {
        margin-bottom: 10px;
    }

    :deep(.panel__title-row h2) {
        font-size: 15px;
        color: var(--text-color--primary);
    }
}

.robot-log-section {
    flex: 1.05 1 0;
    min-width: 0;

    :deep(.panel__header) {
        margin-bottom: 10px;
    }

    :deep(.panel__title-row h2) {
        font-size: 15px;
        color: var(--text-color--primary);
    }
}

.robot-detail-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin: 0;

    div {
        flex: 1 1 calc(50% - 6px);
        min-width: 0;
    }

    dt {
        margin-bottom: 4px;
        color: var(--text-color--secondary);
        font-size: 11px;
    }

    dd {
        margin: 0;
        overflow: hidden;
        color: var(--text-color--primary);
        font-size: 14px;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.robot-terminal-log {
    overflow: hidden;
    border-radius: 8px;
    background: #050812;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--secondary-color) 16%, transparent);
}

.terminal-body {
    display: flex;
    max-height: 200px;
    flex-direction: column;
    gap: 4px;
    overflow: auto;
    height: 100%;
    background-color: #000000;
    border-radius: 4px;
    padding: 8px;
}

.terminal-line {
    display: flex;
    gap: 8px;
    color: color-mix(in srgb, var(--secondary-color) 86%, #ffffff);
    font-family: Consolas, 'Courier New', monospace;
    font-size: 11px;

    time {
        width: 160px;
        color: color-mix(in srgb, var(--text-color--muted) 88%, #ffffff);
    }
}

.terminal-prompt {
    color: var(--primary-color);
    font-weight: 900;
}

.terminal-level {
    font-weight: 900;
}

.terminal-level.is-info {
    color: var(--info-color);
}

.terminal-level.is-warn {
    color: var(--warning-color);
}

.terminal-level.is-error {
    color: var(--danger-color);
}

.terminal-message {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 900px) {
    .robot-detail-summary,
    .robot-dialog-columns {
        flex-direction: column;
    }

    .robot-image-panel {
        flex-basis: auto;
    }

    .robot-key-info-grid {
        flex-wrap: wrap;
    }

    .robot-key-info-item {
        flex-basis: calc(50% - 4px);
    }

    .robot-detail-grid {
        flex-direction: row;
    }
}
</style>
