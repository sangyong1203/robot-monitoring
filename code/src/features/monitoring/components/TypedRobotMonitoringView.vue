<template>
    <section class="cyber-monitoring">
        <!-- Top HUD Header Panel -->
        <Panel class="hud-header-panel">
            <div class="hud-header-content">
                <div class="hud-left">
                    <div class="live-badge">
                        <span class="pulse-dot"></span>
                        <span class="live-text">LIVE</span>
                    </div>
                    <div class="hud-title-wrap">
                        <span class="hud-subtitle">{{ updatedLabel }}</span>
                    </div>
                </div>

                <div class="hud-metrics">
                    <div class="hud-chip">
                        <div class="chip-info">
                            <Bot class="chip-icon text-blue" :size="18" />
                            <span class="chip-label">운영 로봇</span>
                        </div>
                        <strong class="chip-val">{{ snapshot?.counts.total ?? 7 }}대</strong>
                    </div>
                    <div class="hud-chip">
                        <div class="chip-info">
                            <Radio class="chip-icon text-green" :size="18" />
                            <span class="chip-label">정상 통신</span>
                        </div>
                        <strong class="chip-val text-green">{{ snapshot?.counts.online ?? 6 }}</strong>
                    </div>
                    <div class="hud-chip">
                        <div class="chip-info">
                            <Zap class="chip-icon text-amber" :size="18" />
                            <span class="chip-label">통신 지연</span>
                        </div>
                        <strong class="chip-val text-amber">{{ snapshot?.counts.stale ?? 1 }}</strong>
                    </div>
                    <div class="hud-chip">
                        <div class="chip-info">
                            <ShieldAlert class="chip-icon text-red" :size="18" />
                            <span class="chip-label">비상 정지</span>
                        </div>
                        <strong class="chip-val text-red">0</strong>
                    </div>
                </div>

                <div class="hud-actions">
                    <DropdownList
                        v-model="selectedMapId"
                        :list="snapshot?.maps ?? []"
                        option-label="name"
                        option-value="id"
                        placeholder="관제 지도 선택"
                        selection-width="220px"
                        :clearable="false"
                    />
                    <el-button type="danger" class="btn-estop-card" @click="openGlobalEmergency">
                        <ShieldAlert :size="16" /> 전체 E-STOP (일괄 정지)
                    </el-button>
                </div>
            </div>
        </Panel>

        <!-- Main Cyber Content Grid -->
        <div class="cyber-grid">
            <!-- Left/Center: High-Tech 2D Map Canvas -->
            <Panel class="map-container-panel" :fill="true">
                <div class="map-toolbar">
                    <div class="map-info-tag">
                        <span>현재 지도:</span>
                        <strong>{{ selectedMap?.name ?? '도면' }}</strong>
                        <span class="map-res">({{ selectedMap?.width ?? 1200 }}x{{ selectedMap?.height ?? 800 }})</span>
                    </div>

                    <div class="map-zoom-tools">
                        <div class="zoom-btn-group">
                            <el-button size="small" @click="zoomIn"><ZoomIn :size="14" /></el-button>
                            <el-button size="small" @click="zoomOut"><ZoomOut :size="14" /></el-button>
                            <el-button size="small" @click="resetZoom"><RotateCcw :size="14" /></el-button>
                        </div>
                    </div>
                </div>

                <div
                    class="map-canvas-wrap"
                    :class="{ 'is-dragging': isDragging }"
                    @mousedown="startPan"
                    @mousemove="onPan"
                    @mouseup="endPan"
                    @mouseleave="endPan"
                    @wheel.prevent="onWheel"
                >
                    <svg
                        class="map-svg"
                        :viewBox="viewBoxString"
                        role="img"
                    >
                        <defs>
                            <pattern :id="gridId" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1" />
                            </pattern>
                        </defs>

                        <!-- Map Background Infinite Dark Canvas -->
                        <rect x="-3000" y="-3000" width="8000" height="8000" fill="#080c14" />
                        <image
                            v-if="mapImageSource && !imageFailed"
                            :href="mapImageSource"
                            x="0"
                            y="0"
                            :width="selectedMap?.width ?? 1200"
                            :height="selectedMap?.height ?? 800"
                            preserveAspectRatio="none"
                            opacity="0.8"
                            @error="imageFailed = true"
                        />
                        <rect x="-3000" y="-3000" width="8000" height="8000" :fill="`url(#${gridId})`" opacity="0.6" />

                        <!-- Interactive Robot Markers with Pulsing Aura -->
                        <g
                            v-for="robot in selectedMapRobots"
                            :key="robot.id"
                            class="map-marker-group"
                            :class="{ 'is-active': selectedRobotId === robot.id }"
                            :transform="markerTransform(robot)"
                            @click="selectRobot(robot)"
                        >
                            <!-- Pulsing Aura Ring -->
                            <circle class="marker-pulse-ring" r="28" :stroke="markerColor(robot.communicationStatus)" />
                            
                            <!-- Robot Base Circle -->
                            <circle
                                :r="selectedRobotId === robot.id ? 18 : 14"
                                :fill="markerColor(robot.communicationStatus)"
                                stroke="#080c14"
                                stroke-width="3"
                                class="marker-circle"
                            />

                            <!-- Direction Arrow -->
                            <path
                                d="M 0 -11 L 5 4 L 0 1 L -5 4 Z"
                                fill="#ffffff"
                                :transform="`rotate(${robot.heading})`"
                            />

                            <!-- Robot Label & Telemetry -->
                            <g transform="translate(24, -10)" class="marker-label-box">
                                <rect x="-4" y="-12" width="130" height="34" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                                <text x="0" y="4" class="marker-name">{{ robot.name }}</text>
                                <text x="0" y="18" class="marker-status">
                                    {{ robot.batteryPercent }}% · {{ statusLabel(robot.status) }}
                                </text>
                            </g>
                        </g>
                    </svg>
                </div>
            </Panel>

            <!-- Right Vertical Panel: Modern Telemetry Cards -->
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
                        @click="selectRobot(robot)"
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

                        <!-- Battery Progress Bar (Single Line) -->
                        <div class="battery-meter">
                            <span class="meter-label">배터리</span>
                            <div class="meter-bar-track">
                                <div
                                    class="meter-bar-fill"
                                    :style="{ width: `${robot.batteryPercent}%`, background: batteryGradient(robot.batteryPercent) }"
                                ></div>
                            </div>
                            <strong class="meter-val">{{ robot.batteryPercent }}%</strong>
                        </div>

                        <!-- Digital Coordinate Readout -->
                        <div class="digital-coords">
                            <div class="coord-cell"><span>X</span><strong>{{ robot.x.toFixed(2) }}m</strong></div>
                            <div class="coord-cell"><span>Y</span><strong>{{ robot.y.toFixed(2) }}m</strong></div>
                            <div class="coord-cell"><span>방향</span><strong>{{ robot.heading }}°</strong></div>
                        </div>

                        <!-- Card Action Tools -->
                        <div class="card-actions">
                            <el-button size="small" type="primary" plain @click.stop="openControlDialogWithRobot(robot)">
                                수동 제어
                            </el-button>
                            <el-button size="small" type="primary" plain @click.stop="openCameraModal(robot)">
                                <Camera :size="13" /> 카메라
                            </el-button>
                            <el-button size="small" type="danger" class="btn-estop-card" @click.stop="triggerRobotEStop(robot)">
                                E-Stop
                            </el-button>
                        </div>
                    </div>
                </div>
            </Panel>
        </div>

        <!-- Robot Control Modal -->
        <BaseDialog
            v-model="controlDialogVisible"
            class="control-dialog"
            :title="`${selectedRobot?.name ?? ''} 수동 원격 제어`"
            width="560px"
        >
            <el-form label-position="top">
                <el-form-item label="명령 유형" required>
                    <el-select v-model="commandForm.commandType" style="width:100%">
                        <el-option label="목적지 좌표 이동 (MOVE_TO)" value="MOVE_TO" />
                        <el-option label="운영 모드 변경 (SET_MODE)" value="SET_MODE" />
                        <el-option label="미션 시작 (START_MISSION)" value="START_MISSION" />
                        <el-option label="Safe Stop (안전 정지)" value="SAFE_STOP" />
                    </el-select>
                </el-form-item>

                <div v-if="commandForm.commandType === 'MOVE_TO'" class="grid-2col">
                    <el-form-item label="목적지 X (m)" required>
                        <el-input-number v-model="commandForm.x" :precision="2" style="width:100%" />
                    </el-form-item>
                    <el-form-item label="목적지 Y (m)" required>
                        <el-input-number v-model="commandForm.y" :precision="2" style="width:100%" />
                    </el-form-item>
                </div>

                <el-form-item v-else-if="commandForm.commandType === 'SET_MODE'" label="운영 모드">
                    <el-radio-group v-model="commandForm.mode">
                        <el-radio-button value="AUTO">자동 (AUTO)</el-radio-button>
                        <el-radio-button value="MANUAL">수동 (MANUAL)</el-radio-button>
                        <el-radio-button value="PAUSED">일시정지 (PAUSED)</el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="controlDialogVisible = false">취소</el-button>
                <el-button type="primary" :loading="commandSaving" @click="submitCommand">명령 집행</el-button>
            </template>
        </BaseDialog>

        <!-- Camera Stream Modal -->
        <BaseDialog
            v-model="cameraModalVisible"
            class="camera-modal"
            :title="`${activeCameraRobot?.name ?? ''} 실시간 카메라 스트림`"
            width="780px"
        >
            <div class="camera-stream-grid">
                <div class="cam-box">
                    <div class="cam-header">CAM 1: 전방 주행 카메라</div>
                    <div class="cam-feed-mock">
                        <Camera :size="32" />
                        <span>LIVE STREAM (1080p)</span>
                    </div>
                </div>
                <div class="cam-box">
                    <div class="cam-header">CAM 2: 로봇 작업/페이로드 카메라</div>
                    <div class="cam-feed-mock">
                        <Camera :size="32" />
                        <span>LIVE STREAM (1080p)</span>
                    </div>
                </div>
            </div>
        </BaseDialog>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusBadge from '@/components/StatusBadge.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import {
    Bot,
    Radio,
    Zap,
    ShieldAlert,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Camera,
} from '@lucide/vue'
import { simulationService } from '@/services/simulation.service'
import { useAuthenticatedMapImage } from '@/composables/useAuthenticatedMapImage'
import { formatDateTime } from '@/utils/date.util'
import { worldToPixel } from '@/utils/mapCoordinates'
import type {
    CommunicationStatus,
    IntegratedMonitoringSnapshot,
    MonitoringMap,
    MonitoringRobot,
} from '../service/integrated/integratedMonitoring.types'
import { getTypedMonitoring, sendRobotCommand } from '../service/typed/typedMonitoring.api'
import type { RobotCommandType, TypedMonitoringKind } from '../service/typed/typedMonitoring.api'

const props = defineProps<{ kind: TypedMonitoringKind; title: string }>()

const snapshot = ref<IntegratedMonitoringSnapshot | null>(null)
const selectedMapId = ref<number | null>(1)
const selectedRobotId = ref<number | null>(1)
const imageFailed = ref(false)
const zoomLevel = ref(1)

const controlDialogVisible = ref(false)
const cameraModalVisible = ref(false)
const activeCameraRobot = ref<MonitoringRobot | null>(null)
const commandSaving = ref(false)

const commandForm = reactive({
    commandType: 'MOVE_TO' as RobotCommandType,
    x: 15.0,
    y: 10.0,
    mode: 'AUTO',
    missionId: 1,
})

const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const gridId = computed(() => `cyber-grid-${props.kind.toLowerCase()}`)
const robots = computed(() => snapshot.value?.robots ?? [])
const selectedRobot = computed(() => robots.value.find(r => r.id === selectedRobotId.value) ?? null)
const selectedMap = computed(() => snapshot.value?.maps.find(m => m.id === selectedMapId.value) ?? snapshot.value?.maps[0] ?? null)
const selectedMapRobots = computed(() => selectedMap.value ? robots.value.filter(r => r.mapId === selectedMap.value?.id) : robots.value)
const selectedMapImageUrl = computed(() => selectedMap.value?.imageUrl ?? '')
const { imageSource: mapImageSource } = useAuthenticatedMapImage(selectedMapImageUrl)

const updatedLabel = computed(() => snapshot.value?.generatedAt ? `수신 시각: ${formatDateTime(snapshot.value.generatedAt)}` : '실시간 수신 중')

const viewBoxString = computed(() => {
    const mapW = selectedMap.value?.width ?? 1200
    const mapH = selectedMap.value?.height ?? 800
    const viewW = mapW / zoomLevel.value
    const viewH = mapH / zoomLevel.value
    const minX = (mapW - viewW) / 2 - 30 + panX.value
    const minY = (mapH - viewH) / 2 - 30 + panY.value
    return `${minX} ${minY} ${viewW + 60} ${viewH + 60}`
})

const startPan = (e: MouseEvent) => {
    if (e.button !== 0) return
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
}

const onPan = (e: MouseEvent) => {
    if (!isDragging.value) return
    const dx = (e.clientX - dragStart.value.x) / zoomLevel.value
    const dy = (e.clientY - dragStart.value.y) / zoomLevel.value
    panX.value -= dx
    panY.value -= dy
    dragStart.value = { x: e.clientX, y: e.clientY }
}

const endPan = () => {
    isDragging.value = false
}

const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
        if (zoomLevel.value < 3.0) zoomLevel.value += 0.15
    } else {
        if (zoomLevel.value > 0.6) zoomLevel.value -= 0.15
    }
}

let unsubscribeSim: (() => void) | null = null

onMounted(async () => {
    try {
        const res = await getTypedMonitoring(props.kind)
        snapshot.value = res.data
    } catch {
        // Fallback
    }

    unsubscribeSim = simulationService.subscribe((updatedRobots) => {
        if (!snapshot.value) return
        let filtered = updatedRobots
        if (props.kind === 'WORK') filtered = updatedRobots.filter(r => r.robotType === 'WORK')
        else if (props.kind === 'SURVEILLANCE') filtered = updatedRobots.filter(r => r.robotType === 'SURVEILLANCE')

        snapshot.value.robots = filtered
        snapshot.value.generatedAt = new Date().toISOString()
    })
})

onBeforeUnmount(() => {
    if (unsubscribeSim) unsubscribeSim()
})

const selectRobot = (robot: MonitoringRobot) => {
    selectedRobotId.value = robot.id
    selectedMapId.value = robot.mapId
}

const zoomIn = () => { if (zoomLevel.value < 3.0) zoomLevel.value += 0.25 }
const zoomOut = () => { if (zoomLevel.value > 0.6) zoomLevel.value -= 0.25 }
const resetZoom = () => {
    zoomLevel.value = 1
    panX.value = 0
    panY.value = 0
}

const markerTransform = (robot: MonitoringRobot) => {
    if (!selectedMap.value) return `translate(${robot.x * 15}, ${robot.y * 15})`
    const point = worldToPixel({ x: robot.x, y: robot.y }, selectedMap.value)
    return `translate(${point.pixel_x}, ${point.pixel_y})`
}

const markerColor = (status: CommunicationStatus) =>
    ({ ONLINE: '#22c55e', STALE: '#f59e0b', OFFLINE: '#ef4444' })[status] ?? '#22c55e'

const communicationLabel = (status: CommunicationStatus) =>
    ({ ONLINE: '정상', STALE: '지연', OFFLINE: '오프라인' })[status] ?? '정상'

const statusTag = (status: CommunicationStatus) =>
    (({ ONLINE: 'success', STALE: 'warning', OFFLINE: 'danger' }) as const)[status] ?? 'success'

const statusLabel = (status?: string) => {
    const map: Record<string, string> = { RUNNING: '작업 중', IDLE: '대기', CHARGING: '충전 중', ERROR: '오류' }
    return map[status ?? ''] ?? '작업 중'
}

const batteryGradient = (pct: number) => {
    if (pct > 50) return 'linear-gradient(90deg, #22c55e, #10b981)'
    if (pct > 20) return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return 'linear-gradient(90deg, #ef4444, #dc2626)'
}

const openControlDialogWithRobot = (robot: MonitoringRobot) => {
    selectRobot(robot)
    commandForm.x = robot.x
    commandForm.y = robot.y
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

const submitCommand = async () => {
    if (!selectedRobot.value) return
    commandSaving.value = true
    try {
        simulationService.applyCommand(selectedRobot.value.id, commandForm.commandType, {
            x: commandForm.x,
            y: commandForm.y,
            mode: commandForm.mode,
        })
        ElMessage.success(`${selectedRobot.value.name}에 명령이 접수되었습니다.`)
        controlDialogVisible.value = false
    } finally {
        commandSaving.value = false
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

.hud-header-panel {
    padding: 10px 16px;
    flex-shrink: 0;

    :deep(.panel__body) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
}

.hud-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.hud-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.live-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid #22c55e;
    border-radius: 20px;

    .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 10px #22c55e;
        animation: pulse 1.5s infinite;
    }

    .live-text {
        font-size: 11px;
        font-weight: 700;
        color: #22c55e;
        letter-spacing: 0.5px;
    }
}

@keyframes pulse {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
}

.hud-subtitle {
    display: inline-block;
    font-size: 12px;
    width: 180px;
    color: #94a3b8;
}

.hud-metrics {
    display: flex;
    gap: 10px;
}

.hud-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 6px 12px;
    background: #182238;
    border: 1px solid #283654;
    border-radius: 8px;
    width: 130px;

    .chip-info {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .chip-label { font-size: 12px; color: #cbd5e1; }
    .chip-val { font-size: 15px; font-weight: 700; color: #ffffff; }

    .text-green { color: #22c55e; }
    .text-amber { color: #f59e0b; }
    .text-red { color: #ef4444; }
    .text-blue { color: #3b82f6; }
}

.hud-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.map-select { width: 170px; }


/* Main Grid */
.cyber-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 12px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

/* Map Container Panel */
.map-container-panel {
    position: relative;
    overflow: hidden;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;

    :deep(.panel__body) {
        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
        height: 0;
        min-height: 0;
        overflow: hidden;
    }
}

.map-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    flex-shrink: 0;
}

.map-info-tag {
    font-size: 12px;
    color: var(--text-color--secondary);

    strong { color: var(--text-color--white); margin: 0 4px; }
    .map-res { color: var(--text-color--muted); }
}

.map-zoom-tools {
    .zoom-btn-group {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .el-button {
        background: var(--surface-elevated-color) !important;
        border-color: var(--border-color) !important;
        color: var(--text-color--primary) !important;
        border-radius: 6px !important;
        margin: 0 !important;
        transition: all 0.2s ease !important;

        &:hover, &:focus {
            background: var(--layout-menu-active-bg-color) !important;
            border-color: var(--primary-color) !important;
            color: var(--primary-color) !important;
            box-shadow: 0 0 10px var(--layout-purple-glow-color) !important;
        }
    }
}

.map-canvas-wrap {
    display: flex;
    flex: 1 1 0%;
    width: 100%;
    height: 0;
    min-height: 0;
    min-width: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #080c14;
    position: relative;
    cursor: grab;
    user-select: none;

    &:active, &.is-dragging {
        cursor: grabbing;
    }
}

.map-svg {
    width: 100%;
    height: 100%;
    max-height: 100%;
    display: block;
}

.map-marker-group {
    cursor: pointer;
    transition: transform 0.3s ease;

    .marker-pulse-ring {
        fill: none;
        stroke-width: 2;
        opacity: 0.6;
        animation: ring-expand 2s infinite ease-out;
    }

    .marker-circle {
        transition: r 0.2s ease;
    }

    &:hover .marker-circle, &.is-active .marker-circle {
        r: 20;
    }
}

@keyframes ring-expand {
    0% { r: 14; opacity: 0.8; }
    100% { r: 36; opacity: 0; }
}

.marker-name {
    fill: #fff;
    font-size: 12px;
    font-weight: 700;
}

.marker-status {
    fill: #94a3b8;
    font-size: 10px;
}

/* Telemetry Panel */
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
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;

    .meter-label {
        font-size: 11px;
        color: var(--text-color--secondary);
        white-space: nowrap;
    }

    .meter-bar-track {
        flex: 1;
        height: 5px;
        background: var(--surface-color);
        border-radius: 3px;
        overflow: hidden;
    }

    .meter-bar-fill {
        height: 100%;
        transition: width 0.3s ease;
    }

    .meter-val {
        font-size: 11px;
        color: var(--text-color--white);
        white-space: nowrap;
        min-width: 28px;
        text-align: right;
    }
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

        span { font-size: 10px; color: var(--text-color--muted); }
        strong { font-size: 11px; color: var(--secondary-color); font-family: monospace; font-weight: 700; }
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

.grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.camera-stream-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.cam-box {
    background: #080c14;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);

    .cam-header {
        padding: 8px 12px;
        background: rgba(255,255,255,0.05);
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
    }

    .cam-feed-mock {
        height: 240px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #38bdf8;

        span { font-size: 11px; color: #64748b; letter-spacing: 1px; }
    }
}
</style>
