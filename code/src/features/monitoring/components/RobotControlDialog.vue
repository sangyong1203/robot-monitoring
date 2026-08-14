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
                    <StatusBadge
                        :label="stateLabel(robot.status || 'RUNNING')"
                        :variant="stateVariant(robot.status || 'RUNNING')"
                    />
                    <span class="comm-status-chip" :class="robot.communicationStatus.toLowerCase()">
                        <span class="status-dot"></span>
                        {{ robot.communicationStatus }}
                    </span>
                    <span class="battery-chip">
                        <Battery :size="15" class="bat-icon" />
                        <strong class="bat-val">{{ robot.batteryPercent }}%</strong>
                    </span>
                </div>
            </div>
        </Panel>

        <RobotManualControlPanel :robot="robot" />

        <template #footer>
            <el-button @click="$emit('update:visible', false)">닫기</el-button>
        </template>

    </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@/components/BaseDialog.vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import RobotManualControlPanel from '@/features/robotManualControl/components/RobotManualControlPanel.vue'
import { Battery } from '@lucide/vue'
import type { MonitoringRobot } from '../service/integrated/integratedMonitoring.types'

defineProps<{
    visible: boolean
    robot: MonitoringRobot | null
}>()

const stateLabel = (status: string) => {
    switch (status) {
        case 'IDLE':
            return '대기 중 (IDLE)'
        case 'RUNNING':
            return '작업 중 (RUNNING)'
        case 'PAUSED':
            return '일시정지 (PAUSED)'
        case 'ERROR':
            return '오류 발생 (ERROR)'
        default:
            return status
    }
}

const stateVariant = (status: string) => {
    switch (status) {
        case 'RUNNING':
            return 'success'
        case 'IDLE':
            return 'info'
        case 'PAUSED':
            return 'warning'
        case 'ERROR':
            return 'danger'
        default:
            return 'info'
    }
}
</script>

<style scoped lang="scss">

/* 1. Header Telemetry Bar Panel */
.telemetry-header-panel {
    margin-bottom: 12px;
    padding: 12px 16px;

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

            &.work {
                background: rgba(59, 130, 246, 0.25);
                color: #60a5fa;
                border: 1px solid rgba(59, 130, 246, 0.5);
            }
            &.surveillance {
                background: rgba(168, 85, 247, 0.25);
                color: #c084fc;
                border: 1px solid rgba(168, 85, 247, 0.5);
            }
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

            &.online {
                color: #4ade80;
                background: rgba(74, 222, 128, 0.18);
                border: 1px solid rgba(74, 222, 128, 0.3);
            }
            &.stale {
                color: #facc15;
                background: rgba(250, 204, 21, 0.18);
                border: 1px solid rgba(250, 204, 21, 0.3);
            }
            &.offline {
                color: #f87171;
                background: rgba(248, 113, 113, 0.18);
                border: 1px solid rgba(248, 113, 113, 0.3);
            }
        }

        .battery-chip {
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
        }
    }
}
</style>
