<template>
    <Panel class="map-container-panel" :fill="true">
        <div class="map-toolbar">
            <div class="map-info-tag">
                <span>지도:</span>
                <strong>{{ map.name }}</strong>
                <span class="map-res">({{ map.width }}x{{ map.height }})</span>
            </div>

            <div class="map-zoom-tools">
                <div class="zoom-btn-group">
                    <el-button size="small" @click="zoomIn"><ZoomIn :size="12" /></el-button>
                    <el-button size="small" @click="zoomOut"><ZoomOut :size="12" /></el-button>
                    <el-button size="small" @click="resetZoom"><RotateCcw :size="12" /></el-button>
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
            <svg class="map-svg" :viewBox="viewBoxString" role="img">
                <defs>
                    <pattern :id="gridPatternId" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1" />
                    </pattern>
                </defs>

                <!-- Map Background Canvas -->
                <rect x="-3000" y="-3000" width="8000" height="8000" fill="#080c14" />
                <image
                    v-if="mapImageSource && !imageFailed"
                    :href="mapImageSource"
                    x="0"
                    y="0"
                    :width="map.width"
                    :height="map.height"
                    preserveAspectRatio="none"
                    opacity="0.85"
                    @error="imageFailed = true"
                />
                <rect x="-3000" y="-3000" width="8000" height="8000" :fill="`url(#${gridPatternId})`" opacity="0.6" />

                <!-- Interactive Robot Markers -->
                <g
                    v-for="robot in displayRobots"
                    :key="robot.id"
                    class="map-marker-group"
                    :class="{ 'is-active': selectedRobotId === robot.id }"
                    :transform="markerTransform(robot)"
                    @click="$emit('selectRobot', robot)"
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
                        <text x="0" y="20" class="marker-status">
                            {{ robot.batteryPercent }}% · {{ statusLabel(robot.status) }}
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Panel from '@/components/Panel.vue'
import { ZoomIn, ZoomOut, RotateCcw } from '@lucide/vue'
import { useAuthenticatedMapImage } from '@/composables/useAuthenticatedMapImage'
import { worldToPixel } from '@/utils/mapCoordinates'
import type {
    CommunicationStatus,
    MonitoringMap,
    MonitoringRobot,
} from '../service/integrated/integratedMonitoring.types'

const props = defineProps<{
    map: MonitoringMap
    allRobots: MonitoringRobot[]
    selectedRobotId: number | null
    isIntegratedMode?: boolean
}>()

defineEmits<{
    (e: 'selectRobot', robot: MonitoringRobot): void
}>()

const imageFailed = ref(false)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const gridPatternId = computed(() => `grid-pattern-${props.map.id}`)
const mapImageUrl = computed(() => props.map.imageUrl ?? '')
const { imageSource: mapImageSource } = useAuthenticatedMapImage(mapImageUrl)

// Check if this map is the global Site Map
const isSiteMap = computed(() => props.map.code === 'MAP-SITE-01')

// Robots displayed on this map
const displayRobots = computed(() => {
    if (isSiteMap.value) {
        return props.allRobots
    }
    return props.allRobots.filter(r => r.mapId === props.map.id)
})

const viewBoxString = computed(() => {
    const mapW = props.map.width
    const mapH = props.map.height
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

const zoomIn = () => { if (zoomLevel.value < 3.0) zoomLevel.value += 0.25 }
const zoomOut = () => { if (zoomLevel.value > 0.6) zoomLevel.value -= 0.25 }
const resetZoom = () => {
    zoomLevel.value = 1
    panX.value = 0
    panY.value = 0
}

const markerTransform = (robot: MonitoringRobot) => {
    const targetX = isSiteMap.value ? (robot.siteX ?? robot.x) : robot.x
    const targetY = isSiteMap.value ? (robot.siteY ?? robot.y) : robot.y
    const point = worldToPixel({ x: targetX, y: targetY }, props.map)
    return `translate(${point.pixel_x}, ${point.pixel_y})`
}

const markerColor = (status: CommunicationStatus) =>
    ({ ONLINE: '#22c55e', STALE: '#f59e0b', OFFLINE: '#ef4444' })[status] ?? '#22c55e'

const statusLabel = (status?: string) => {
    const map: Record<string, string> = { RUNNING: '작업 중', IDLE: '대기', CHARGING: '충전 중', ERROR: '오류' }
    return map[status ?? ''] ?? '작업 중'
}
</script>

<style scoped lang="scss">
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
    margin-bottom: 4px;
    flex-shrink: 0;
}

.map-info-tag {
    font-size: 11px;
    color: var(--text-color--secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    strong { color: var(--text-color--white); margin: 0 4px; }
    .map-res { color: var(--text-color--muted); font-size: 10px; }
}

.map-zoom-tools {
    .zoom-btn-group {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .el-button {
        background: var(--surface-elevated-color) !important;
        border-color: var(--border-color) !important;
        color: var(--text-color--primary) !important;
        border-radius: 4px !important;
        padding: 4px 6px !important;
        height: 24px !important;
        margin: 0 !important;
    }
}

.map-canvas-wrap {
    display: flex;
    flex: 1 1 0%;
    width: 100%;
    height: 0;
    min-height: 0;
    min-width: 0;
    border-radius: 6px;
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
    font-size: 14px;
    font-weight: 700;
}

.marker-status {
    fill: #cdcecf;
    font-size: 12px;
}
</style>
