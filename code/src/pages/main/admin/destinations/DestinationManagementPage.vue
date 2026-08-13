<template>
    <div class="management-page">
        <!-- 상단 검색 및 지도 선택 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="목적지 이름, 코드 검색"
                width="280px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="selectedMapId"
                label="대상 지도"
                placeholder="대상 지도 선택"
                :list="mapOptions"
                optionLabel="name"
                optionValue="id"
                selection-width="280px"
                @onChange="handleMapChange"
            />
            <DropdownList
                v-model="query.type"
                label="목적지 타입"
                placeholder="목적지 타입 선택"
                :list="typeOptions"
                optionLabel="label"
                optionValue="value"
                selectionWidth="160px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 목록 및 2D 위치 지도 뷰어 -->
        <Panel class="management-page__panel" title="지도 목적지 목록" :total="destinations.length" fill>
            <template #headerRight>
                <el-button type="primary" @click="openCreateDialog()"> 신규 목적지 등록 </el-button>
            </template>

            <div class="destination-layout">
                <!-- 2D 지도 위치 인터랙티브 피커 영역 -->
                <div class="destination-map-wrap">
                    <div class="destination-map-header">
                        <span class="header-title">
                            2D CAD 지도 피커 — {{ currentMap?.name || '지도 선택 안됨' }}
                        </span>
                        <span class="header-hint">
                            💡 지도를 클릭하면 해당 위치(X, Y)로 신규 목적지가 생성됩니다.
                        </span>
                    </div>
                    <div class="destination-map-canvas" ref="canvasContainerRef">
                        <svg ref="svgRef" :viewBox="viewBoxString" class="map-svg" @click="handleCanvasClick">
                            <rect width="100%" height="100%" fill="#080c14" />
                            <image :href="mapImageSource" width="100%" height="100%" preserveAspectRatio="none" />

                            <!-- 등록된 목적지 핀 & 방향 마커 -->
                            <g
                                v-for="dest in destinations"
                                :key="dest.id"
                                class="dest-marker"
                                :class="{ 'is-selected': selectedDestId === dest.id }"
                                :transform="markerTransform(dest)"
                                @click.stop="selectedDestId = dest.id"
                            >
                                <circle
                                    :r="selectedDestId === dest.id ? 14 : 10"
                                    :fill="destTypeColor(dest.type)"
                                    stroke="#ffffff"
                                    stroke-width="2"
                                />
                                <path
                                    d="M 0 -8 L 4 2 L 0 0 L -4 2 Z"
                                    fill="#ffffff"
                                    :transform="`rotate(${dest.heading})`"
                                />
                                <text x="16" y="4" class="dest-text">{{ dest.name }}</text>
                            </g>
                        </svg>
                    </div>
                </div>

                <!-- 오른쪽 테이블 -->
                <div class="destination-table-wrap">
                    <el-table
                        v-loading="loading"
                        :data="destinations"
                        row-key="id"
                        height="100%"
                        class="management-page__table"
                        @row-click="(row: DestinationItem) => (selectedDestId = row.id)"
                        @row-dblclick="openEditDialog"
                    >
                        <el-table-column label="목적지 이름" min-width="170">
                            <template #default="{ row }">
                                <TableRowTooltip :content="row.name" />
                            </template>
                        </el-table-column>

                        <el-table-column label="목적지 코드" width="130" align="center">
                            <template #default="{ row }">
                                <TableRowTooltip :content="row.code" />
                            </template>
                        </el-table-column>

                        <el-table-column prop="type" label="타입" width="120" align="center">
                            <template #default="{ row }">
                                <StatusBadge :label="typeLabel(row.type)" :variant="typeVariant(row.type)" />
                            </template>
                        </el-table-column>

                        <el-table-column label="적용 로봇" width="100" align="center">
                            <template #default="{ row }">
                                <StatusBadge
                                    :label="
                                        row.targetRobotType === 'WORK'
                                            ? '작업용'
                                            : row.targetRobotType === 'SURVEILLANCE'
                                              ? '감시용'
                                              : '공용'
                                    "
                                    :variant="
                                        row.targetRobotType === 'WORK'
                                            ? 'info'
                                            : row.targetRobotType === 'SURVEILLANCE'
                                              ? 'warning'
                                              : 'muted'
                                    "
                                />
                            </template>
                        </el-table-column>

                        <el-table-column prop="x" label="X(m)" width="75" align="center" />

                        <el-table-column prop="y" label="Y(m)" width="75" align="center" />

                        <el-table-column prop="heading" label="방향(°)" width="75" align="center" />

                        <el-table-column label="작업" width="100" align="center" fixed="right">
                            <template #default="{ row }">
                                <TableActions>
                                    <el-button type="primary" text title="수정" @click="openEditDialog(row)">
                                        <el-icon><Pencil /></el-icon>
                                    </el-button>
                                    <el-button type="danger" text title="삭제" @click="confirmDelete(row)">
                                        <el-icon><Trash2 /></el-icon>
                                    </el-button>
                                </TableActions>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </Panel>

        <!-- 신규/수정 다이얼로그 컴포넌트 -->
        <DestinationFormDialog
            v-model="dialogVisible"
            :is-edit="dialogIsEdit"
            :map-id="selectedMapId"
            :map-name="selectedMapName"
            :initial-data="selectedDest"
            @saved="handleSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Pencil, Trash2 } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import TableActions from '@/components/TableActions.vue'
import TableRowTooltip from '@/components/TableRowTooltip.vue'
import DestinationFormDialog from './components/DestinationFormDialog.vue'
import { deleteDestination, getDestinations } from './service/destinations.api'
import type { DestinationItem, DestinationType } from './service/destinations.types'
import { fetchMockMaps } from '../maps/service/maps.mock'
import type { MapItem } from '../maps/service/maps.types'
import { pixelToWorld, worldToPixel } from '@/utils/mapCoordinates'

const route = useRoute()
const loading = ref(false)
const maps = ref<MapItem[]>([])
const destinations = ref<DestinationItem[]>([])
const selectedMapId = ref<number>(Number(route.query.mapId) || 1)
const selectedDestId = ref<number | null>(1)

const svgRef = ref<SVGSVGElement | null>(null)

const query = reactive<{ keyword: string; type?: DestinationType }>({
    keyword: '',
    type: undefined,
})

const currentMap = computed(() => maps.value.find(m => m.id === selectedMapId.value) ?? maps.value[0])
const mapOptions = computed(() => maps.value)
const mapImageUrl = computed(() => currentMap.value?.imageUrl ?? '/sample_map/site_map.svg')
const mapImageSource = mapImageUrl

const viewBoxString = computed(() => {
    const w = currentMap.value?.width || 1600
    const h = currentMap.value?.height || 800
    return `0 0 ${w} ${h}`
})

const typeOptions = [
    { label: '전체 타입', value: undefined },
    { label: '작업 지점', value: 'WORK_SPOT' },
    { label: '대기 지점', value: 'WAITING_SPOT' },
    { label: '충전소', value: 'CHARGING_STATION' },
    { label: '순찰 웨이포인트', value: 'PATROL_WAYPOINT' },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const selectedDest = ref<DestinationItem | null>(null)

const selectedMapName = computed(() => currentMap.value?.name || '지도 선택 안됨')
const selectedDestName = computed(
    () => destinations.value.find(d => d.id === selectedDestId.value)?.name || '선택 안됨',
)

const typeLabel = (type: DestinationType) => {
    switch (type) {
        case 'WORK_SPOT':
            return '작업지점'
        case 'WAITING_SPOT':
            return '대기지점'
        case 'CHARGING_STATION':
            return '충전소'
        case 'PATROL_WAYPOINT':
            return '순찰웨이포인트'
        case 'STORAGE_AREA':
            return '저장구역'
        default:
            return type
    }
}

const typeVariant = (type: DestinationType) => {
    switch (type) {
        case 'WORK_SPOT':
            return 'progress'
        case 'CHARGING_STATION':
            return 'success'
        case 'WAITING_SPOT':
            return 'info'
        case 'PATROL_WAYPOINT':
            return 'warning'
        default:
            return 'muted'
    }
}

const destTypeColor = (type: DestinationType) => {
    switch (type) {
        case 'WORK_SPOT':
            return '#e76dff'
        case 'CHARGING_STATION':
            return '#15e0b7'
        case 'WAITING_SPOT':
            return '#8cc8ff'
        case 'PATROL_WAYPOINT':
            return '#f6bd60'
        default:
            return '#ffffff'
    }
}

const markerTransform = (dest: DestinationItem) => {
    if (!currentMap.value) return `translate(${dest.x * 20}, ${dest.y * 20})`

    const isSiteMap = currentMap.value.code === 'MAP-SITE-01'
    const posX = isSiteMap ? dest.siteX ?? dest.x : dest.x
    const posY = isSiteMap ? dest.siteY ?? dest.y : dest.y

    const pt = worldToPixel({ x: posX, y: posY }, currentMap.value)
    return `translate(${pt.pixel_x}, ${pt.pixel_y})`
}

const handleCanvasClick = (e: MouseEvent) => {
    if (!svgRef.value || !currentMap.value) return
    const rect = svgRef.value.getBoundingClientRect()
    const pixelX = ((e.clientX - rect.left) / rect.width) * currentMap.value.width
    const pixelY = ((e.clientY - rect.top) / rect.height) * currentMap.value.height

    const worldPoint = pixelToWorld({ pixel_x: pixelX, pixel_y: pixelY }, currentMap.value)

    openCreateDialog({
        x: Number(worldPoint.x.toFixed(2)),
        y: Number(worldPoint.y.toFixed(2)),
    })
}

const loadMaps = async () => {
    const mapList = await fetchMockMaps({ isActive: true })
    maps.value = mapList
    if (mapList.length > 0 && !mapList.some(m => m.id === selectedMapId.value)) {
        selectedMapId.value = mapList[0].id
    }
}

const handleMapChange = () => {
    handleSearch()
}

const handleSearch = async () => {
    loading.value = true
    try {
        destinations.value = await getDestinations({
            mapId: selectedMapId.value,
            type: query.type,
            keyword: query.keyword,
        })
        if (destinations.value.length > 0 && !destinations.value.some(d => d.id === selectedDestId.value)) {
            selectedDestId.value = destinations.value[0].id
        }
    } finally {
        loading.value = false
    }
}

const openCreateDialog = (initialCoords?: { x: number; y: number }) => {
    dialogIsEdit.value = false
    selectedDest.value = initialCoords ? ({ x: initialCoords.x, y: initialCoords.y, heading: 0 } as any) : null
    dialogVisible.value = true
}

const openEditDialog = (row: DestinationItem) => {
    dialogIsEdit.value = true
    selectedDest.value = row
    dialogVisible.value = true
}

const confirmDelete = async (row: DestinationItem) => {
    try {
        await ElMessageBox.confirm(`목적지 '${row.name}'을(를) 삭제하시겠습니까?`, '목적지 삭제 확인', {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
        })
        await deleteDestination(row.id)
        ElMessage.success('목적지가 삭제되었습니다.')
        await handleSearch()
    } catch {
        // Canceled
    }
}

onMounted(async () => {
    await loadMaps()
    await handleSearch()
})
</script>

<style scoped lang="scss">
.destination-layout {
    display: flex;
    gap: 20px;
    flex: 1 1 auto;
    min-height: 0;
}

.destination-map-wrap {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--border-glass-color);
    background: #090c14;
    overflow: hidden;
}

.destination-map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.03);

    .header-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--secondary-color);
    }

    .header-hint {
        font-size: 12px;
        color: #94a3b8;
    }
}

.destination-map-canvas {
    flex: 1;
    position: relative;
    cursor: crosshair;
}

.map-svg {
    width: 100%;
    height: 100%;
}

.dest-marker {
    cursor: pointer;
    transition: transform 200ms ease;

    &:hover,
    &.is-selected {
        circle {
            stroke: var(--primary-color);
            stroke-width: 4px;
        }
    }
}

.dest-text {
    fill: #ffffff;
    font-size: 12px;
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.destination-table-wrap {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    min-width: 0;
}
</style>
