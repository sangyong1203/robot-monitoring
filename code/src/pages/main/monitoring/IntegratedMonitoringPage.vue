<template>
    <section class="cyber-monitoring">
        <!-- 1. Top HUD Header Block Component -->
        <MonitoringHudHeader
            :snapshot="snapshot"
            :updated-label="updatedLabel"
            v-model:selected-map-ids="selectedMapIds"
            @global-estop="openGlobalEmergency"
        />

        <!-- Main Cyber Content Grid -->
        <div class="cyber-grid">
            <!-- 2. Left/Center Multi-Map Canvas Grid Block Component -->
            <MonitoringMapCanvas
                :selected-maps="selectedMaps"
                :all-robots="robots"
                :selected-robot-id="selectedRobotId"
                :is-integrated-mode="true"
                :loading="loading"
                @select-robot="selectRobot"
            />

            <!-- 3. Right Telemetry Cards Panel Block Component -->
            <MonitoringTelemetryPanel
                :robots="robots"
                :selected-robot-id="selectedRobotId"
                @select-robot="selectRobot"
                @open-control="openControlDialogWithRobot"
                @open-camera="openCameraModal"
                @trigger-estop="triggerRobotEStop"
            />
        </div>

        <!-- Reusable Robot Control Modal Dialog -->
        <RobotControlDialog
            v-model:visible="controlDialogVisible"
            :robot="selectedRobot"
        />

        <!-- Reusable Robot Camera Stream Modal Dialog -->
        <RobotCameraDialog
            v-model:visible="cameraModalVisible"
            :robot="activeCameraRobot"
        />
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { simulationService } from '@/services/simulation.service'
import { formatDateTime } from '@/utils/date.util'
import type {
    IntegratedMonitoringSnapshot,
    MonitoringRobot,
} from '@/features/monitoring/service/integrated/integratedMonitoring.types'
import { getTypedMonitoring } from '@/features/monitoring/service/typed/typedMonitoring.api'
import type { TypedMonitoringKind } from '@/features/monitoring/service/typed/typedMonitoring.api'

// Modular Block Components
import MonitoringHudHeader from '@/features/monitoring/components/MonitoringHudHeader.vue'
import MonitoringMapCanvas from '@/features/monitoring/components/MonitoringMapCanvas.vue'
import MonitoringTelemetryPanel from '@/features/monitoring/components/MonitoringTelemetryPanel.vue'

// Modular Dialog Components
import RobotControlDialog from '@/features/monitoring/components/RobotControlDialog.vue'
import RobotCameraDialog from '@/features/monitoring/components/RobotCameraDialog.vue'

const kind: TypedMonitoringKind = 'INTEGRATED'

const snapshot = ref<IntegratedMonitoringSnapshot | null>(null)
const loading = ref(true)
const selectedMapIds = ref<number[]>([1])
const selectedRobotId = ref<number | null>(1)

const controlDialogVisible = ref(false)
const cameraModalVisible = ref(false)
const activeCameraRobot = ref<MonitoringRobot | null>(null)

const robots = computed(() => snapshot.value?.robots ?? [])
const selectedRobot = computed(() => robots.value.find(r => r.id === selectedRobotId.value) ?? null)
const selectedMaps = computed(() => snapshot.value?.maps.filter(m => selectedMapIds.value.includes(m.id)) ?? [])

const updatedLabel = computed(() => snapshot.value?.generatedAt ? `수신 시각: ${formatDateTime(snapshot.value.generatedAt)}` : '실시간 수신 중')

let unsubscribeSim: (() => void) | null = null

onMounted(async () => {
    try {
        const res = await getTypedMonitoring(kind)
        snapshot.value = res.data
    } catch {
        // Fallback
    } finally {
        loading.value = false
    }

    unsubscribeSim = simulationService.subscribe((updatedRobots) => {
        if (!snapshot.value) return
        snapshot.value.robots = updatedRobots
        snapshot.value.generatedAt = new Date().toISOString()
    })
})

onBeforeUnmount(() => {
    if (unsubscribeSim) unsubscribeSim()
})

const selectRobot = (robot: MonitoringRobot) => {
    selectedRobotId.value = robot.id
}

const openControlDialogWithRobot = (robot: MonitoringRobot) => {
    selectRobot(robot)
    controlDialogVisible.value = true
}

const openCameraModal = (robot: MonitoringRobot) => {
    activeCameraRobot.value = robot
    cameraModalVisible.value = true
}

const triggerRobotEStop = async (robot: MonitoringRobot) => {
    try {
        await ElMessageBox.confirm(
            `[${robot.name}] 개별 E-Stop(비상정지)을 즉시 집행하시겠습니까?`,
            `${robot.name} 개별 E-Stop 집행`,
            {
                type: 'error',
                confirmButtonText: '개별 E-Stop 집행',
                cancelButtonText: '취소',
                customClass: 'estop-confirm-dialog',
            },
        )
        simulationService.applyCommand(robot.id, 'E_STOP')
        ElMessage.error(`[${robot.name}] 개별 E-Stop 비상정지가 전송되었습니다.`)
    } catch {
        // Cancelled
    }
}

const openGlobalEmergency = async () => {
    try {
        await ElMessageBox.confirm(
            '시설 내 전체 운영 로봇(7대)에 일괄 E-Stop(비상정지)을 집행하시겠습니까?',
            '전체 로봇 일괄 E-STOP 비상집행',
            {
                type: 'error',
                confirmButtonText: '전체 E-Stop 일괄 집행',
                cancelButtonText: '취소',
                customClass: 'estop-confirm-dialog',
            },
        )
        robots.value.forEach(r => simulationService.applyCommand(r.id, 'E_STOP'))
        ElMessage.error('전체 운영 로봇 일괄 E-STOP 비상정지가 전송되었습니다.')
    } catch {
        // Cancelled
    }
}
</script>

<style scoped lang="scss">
.cyber-monitoring {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: calc(100vh - 100px);
    max-height: calc(100vh - 100px);
    overflow: hidden;
}

/* Main Grid */
.cyber-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 12px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
</style>
