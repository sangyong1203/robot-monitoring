<template>
    <Panel class="telemetry-panel-panel" title="로봇 실시간 텔레메트리" :fill="true">
        <template #headerRight>
            <span class="robot-count-badge">{{ robots.length }}대 가동 중</span>
        </template>

        <div class="robot-card-scroll">
            <div
                v-for="robot in robots"
                :key="robot.id"
                class="robot-cyber-card"
                :class="{ 'is-selected': selectedRobotId === robot.id, 'is-warning': robot.communicationStatus !== 'ONLINE' }"
                @click="$emit('selectRobot', robot)"
            >
                <div class="card-top">
                    <div class="robot-identity">
                        <span class="robot-type-tag">{{ robot.robotType === 'WORK' ? '작업용' : '감시용' }}</span>
                        <strong class="robot-card-title">{{ robot.name }}</strong>
                    </div>
                    <StatusBadge
                        :label="communicationLabel(robot.communicationStatus)"
                        :variant="statusTag(robot.communicationStatus)"
                    />
                </div>

                <!-- MeterBar Component -->
                <MeterBar
                    class="battery-meter"
                    label="배터리"
                    :percent="robot.batteryPercent"
                    :value="`${robot.batteryPercent}%`"
                    :color="batteryGradient(robot.batteryPercent)"
                />

                <!-- Digital Coordinate Readout -->
                <div class="digital-coords">
                    <div class="coord-cell"><span>X</span><strong>{{ robot.x.toFixed(2) }}m</strong></div>
                    <div class="coord-cell"><span>Y</span><strong>{{ robot.y.toFixed(2) }}m</strong></div>
                    <div class="coord-cell"><span>방향</span><strong>{{ robot.heading }}°</strong></div>
                </div>

                <!-- Card Action Tools -->
                <div class="card-actions">
                    <el-button size="small" type="primary" plain @click.stop="$emit('openControl', robot)">
                        수동 제어
                    </el-button>
                    <el-button size="small" type="primary" plain @click.stop="$emit('openCamera', robot)">
                        <Camera :size="13" /> 카메라
                    </el-button>
                    <el-button size="small" type="danger" class="btn-estop-card" @click.stop="$emit('triggerEstop', robot)">
                        E-Stop
                    </el-button>
                </div>
            </div>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import MeterBar from '@/components/MeterBar.vue'
import { Camera } from '@lucide/vue'
import type {
    CommunicationStatus,
    MonitoringRobot,
} from '../service/integrated/integratedMonitoring.types'

defineProps<{
    robots: MonitoringRobot[]
    selectedRobotId: number | null
}>()

defineEmits<{
    (e: 'selectRobot', robot: MonitoringRobot): void
    (e: 'openControl', robot: MonitoringRobot): void
    (e: 'openCamera', robot: MonitoringRobot): void
    (e: 'triggerEstop', robot: MonitoringRobot): void
}>()

const communicationLabel = (status: CommunicationStatus) =>
    ({ ONLINE: '정상', STALE: '지연', OFFLINE: '오프라인' })[status] ?? '정상'

const statusTag = (status: CommunicationStatus) =>
    (({ ONLINE: 'success', STALE: 'warning', OFFLINE: 'danger' }) as const)[status] ?? 'success'

const batteryGradient = (pct: number) => {
    if (pct > 50) return 'linear-gradient(90deg, #22c55e, #10b981)'
    if (pct > 20) return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return 'linear-gradient(90deg, #ef4444, #dc2626)'
}
</script>

<style scoped lang="scss">
.telemetry-panel-panel {
    position: relative;
    overflow: hidden;
    height: 100%;
    min-height: 0;

    :deep(.panel__body) {
        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
        height: 0;
        min-height: 0;
        overflow: hidden;
    }
}

.robot-count-badge { font-size: 12px; color: var(--secondary-color); font-weight: 600; }

.robot-card-scroll {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
}

.robot-cyber-card {
    background: var(--surface-elevated-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover, &.is-selected {
        border-color: var(--primary-color);
        background: var(--layout-menu-active-bg-color);
        box-shadow: 0 0 14px var(--layout-purple-glow-color);
    }

    &.is-warning {
        border-color: #f59e0b;
    }
}

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.robot-identity {
    display: flex;
    align-items: center;
    gap: 8px;
}

.robot-type-tag {
    font-size: 10px;
    padding: 1px 5px;
    background: var(--surface-muted-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color--secondary);
    font-weight: 600;
}

.robot-card-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-color--primary);
}

/* Battery Meter */
.battery-meter {
    margin-bottom: 6px;
}

/* Digital Coords */
.digital-coords {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    padding: 4px 8px;
    border-radius: 6px;
    margin-bottom: 8px;

    .coord-cell {
        display: flex;
        align-items: center;
        gap: 3px;

        span { font-size: 11px; color: var(--text-color--secondary); }
        strong { font-size: 11px; color: var(--secondary-color); font-weight: 700; }
    }
}

.card-actions {
    display: flex;
    gap: 6px;

    .el-button {
        flex: 1;
        font-size: 11px;
        height: 26px !important;
        padding: 4px !important;
    }
}

.btn-estop-card {
    background: rgba(255, 138, 138, 0.18) !important;
    border: 1px solid #ff8a8a !important;
    color: #ff8a8a !important;
    font-weight: 700 !important;
    transition: all 0.2s ease !important;

    &:hover {
        background: #ff8a8a !important;
        color: #0f172a !important;
    }
}
</style>
