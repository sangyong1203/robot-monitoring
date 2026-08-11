<template>
    <div class="map-grid-wrapper" :class="gridLayoutClass">
        <div v-if="loading" class="empty-map-placeholder is-loading">
            <Loader2 class="loading-spinner" :size="22" />
            <span>관제 지도를 불러오는 중입니다...</span>
        </div>
        <template v-else-if="selectedMaps.length > 0">
            <SingleMapItemCanvas
                v-for="mapItem in displayMaps"
                :key="mapItem.id"
                :map="mapItem"
                :all-robots="allRobots"
                :selected-robot-id="selectedRobotId"
                :is-integrated-mode="isIntegratedMode"
                @select-robot="$emit('selectRobot', $event)"
            />
        </template>
        <div v-else class="empty-map-placeholder">
            <span>선택된 관제 지도가 없습니다. 상단 HUD에서 지도를 선택하세요.</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from '@lucide/vue'
import SingleMapItemCanvas from './SingleMapItemCanvas.vue'
import type {
    MonitoringMap,
    MonitoringRobot,
} from '../service/integrated/integratedMonitoring.types'

const props = defineProps<{
    selectedMaps: MonitoringMap[]
    allRobots: MonitoringRobot[]
    selectedRobotId: number | null
    isIntegratedMode?: boolean
    loading?: boolean
}>()

defineEmits<{
    (e: 'selectRobot', robot: MonitoringRobot): void
}>()

const displayMaps = computed(() => props.selectedMaps.slice(0, 4))

const gridLayoutClass = computed(() => {
    const count = displayMaps.value.length
    if (count === 0 || count === 1) return 'grid-layout-1'
    if (count === 2) return 'grid-layout-2'
    return 'grid-layout-4'
})
</script>

<style scoped lang="scss">
.map-grid-wrapper {
    display: grid;
    gap: 8px;
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1;
    overflow: hidden;

    &.grid-layout-1 {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
    }

    &.grid-layout-2 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
    }

    &.grid-layout-4 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
    }
}

.empty-map-placeholder {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #64748b;
    font-size: 14px;

    &.is-loading {
        color: var(--primary-color);
    }
}

.loading-spinner {
    font-size: 20px;
    animation: rotating 2s linear infinite;
}

@keyframes rotating {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
