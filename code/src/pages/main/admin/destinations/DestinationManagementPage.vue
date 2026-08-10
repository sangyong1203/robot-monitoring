<template>
    <div class="management-page">
        <!-- 상단 검색 및 지도 선택 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <DropdownList
                v-model="selectedMapId"
                label="대상 지도"
                :list="mapOptions"
                optionLabel="name"
                optionValue="id"
                width="300px"
                @onChange="handleSearch"
            />
            <DropdownList
                v-model="query.type"
                label="목적지 타입"
                :list="typeOptions"
                optionLabel="label"
                optionValue="value"
                width="200px"
                @onChange="handleSearch"
            />
            <SearchText
                v-model="query.keyword"
                placeholder="목적지 이름, 코드 검색"
                width="280px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 목록 및 2D 위치 지도 뷰어 -->
        <Panel class="management-page__panel" title="지도 목적지 (Position & Heading) 목록" :total="destinations.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    <el-icon><MapPin /></el-icon>
                    신규 목적지 등록
                </el-button>
            </template>

            <div class="destination-layout">
                <!-- 2D 지도 위치 미리보기 영역 -->
                <div class="destination-map-wrap">
                    <div class="destination-map-header">
                        <span>지도 2D 목적지 오버레이 (선택: {{ selectedDestName }})</span>
                    </div>
                    <div class="destination-map-canvas">
                        <svg viewBox="0 0 1200 800" class="map-svg">
                            <rect width="100%" height="100%" fill="#0d111a" />
                            <image href="/sample_map/map.png" width="100%" height="100%" preserveAspectRatio="none" />
                            <!-- 목적지 핀 & 방향 마커 -->
                            <g
                                v-for="dest in destinations"
                                :key="dest.id"
                                class="dest-marker"
                                :class="{ 'is-selected': selectedDestId === dest.id }"
                                :transform="`translate(${dest.x * 30}, ${dest.y * 30})`"
                                @click="selectedDestId = dest.id"
                            >
                                <circle :r="selectedDestId === dest.id ? 14 : 10" :fill="destTypeColor(dest.type)" stroke="#fff" stroke-width="2" />
                                <path d="M 0 -8 L 4 2 L 0 0 L -4 2 Z" fill="#fff" :transform="`rotate(${dest.heading})`" />
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
                        <el-table-column prop="name" label="목적지 이름 및 코드" min-width="180">
                            <template #default="{ row }">
                                <strong style="color: var(--text-color--primary)">{{ row.name }}</strong>
                                <div style="font-size: 11px; color: var(--text-color--body)">{{ row.code }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="type" label="타입" width="130" align="center">
                            <template #default="{ row }">
                                <StatusBadge :label="typeLabel(row.type)" :variant="typeVariant(row.type)" />
                            </template>
                        </el-table-column>

                        <el-table-column label="2D 좌표 (m, deg)" width="150" align="center">
                            <template #default="{ row }">
                                <div style="color: var(--text-color--primary)">X: {{ row.x }}m · Y: {{ row.y }}m</div>
                                <div style="font-size: 11px; color: var(--secondary-color)">방향: {{ row.heading }}°</div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="isActive" label="상태" width="90" align="center">
                            <template #default="{ row }">
                                <StatusBadge :label="row.isActive ? '사용' : '미사용'" :variant="row.isActive ? 'success' : 'danger'" />
                            </template>
                        </el-table-column>

                        <el-table-column label="작업" width="110" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="table-actions">
                                    <el-button
                                        class="table-actions__icon-button"
                                        type="primary"
                                        text
                                        title="수정"
                                        @click="openEditDialog(row)"
                                    >
                                        <el-icon><Pencil /></el-icon>
                                    </el-button>
                                    <el-button
                                        class="table-actions__icon-button"
                                        type="danger"
                                        text
                                        title="삭제"
                                        @click="confirmDelete(row)"
                                    >
                                        <el-icon><Trash2 /></el-icon>
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </Panel>

        <!-- 신규/수정 다이얼로그 -->
        <BaseDialog
            v-model="dialogVisible"
            :title="dialogIsEdit ? '목적지 정보 수정' : '신규 목적지 등록'"
            description="지도 상의 로봇 이동 및 작업 좌표(X, Y)와 방향(Heading)을 등록합니다."
            width="600px"
            :buttonTypes="['Cancel', 'Save']"
            @onSave="handleSave"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
                <el-form-item label="목적지 이름" prop="name">
                    <el-input v-model="form.name" placeholder="예: 무인지게차 팰릿 상차지점 A" />
                </el-form-item>

                <el-form-item label="목적지 코드" prop="code">
                    <el-input v-model="form.code" placeholder="예: DEST-WORK-01" />
                </el-form-item>

                <el-form-item label="목적지 타입" prop="type">
                    <el-select v-model="form.type" style="width: 100%">
                        <el-option label="작업 지점 (WORK_SPOT)" value="WORK_SPOT" />
                        <el-option label="대기 지점 (WAITING_SPOT)" value="WAITING_SPOT" />
                        <el-option label="충전 스테이션 (CHARGING_STATION)" value="CHARGING_STATION" />
                        <el-option label="순찰 웨이포인트 (PATROL_WAYPOINT)" value="PATROL_WAYPOINT" />
                        <el-option label="저장 구역 (STORAGE_AREA)" value="STORAGE_AREA" />
                    </el-select>
                </el-form-item>

                <el-form-item label="소속 지도 ID">
                    <el-input :model-value="selectedMapName" disabled />
                </el-form-item>

                <el-form-item label="X 좌표 (미터)" prop="x">
                    <el-input-number v-model="form.x" :precision="2" :step="0.5" style="width: 100%" />
                </el-form-item>

                <el-form-item label="Y 좌표 (미터)" prop="y">
                    <el-input-number v-model="form.y" :precision="2" :step="0.5" style="width: 100%" />
                </el-form-item>

                <el-form-item label="방향 각도 Heading (0°~360°)" prop="heading" style="grid-column: span 2">
                    <el-slider v-model="form.heading" :min="0" :max="360" show-input />
                </el-form-item>

                <el-form-item label="목적지 설명" style="grid-column: span 2">
                    <el-input v-model="form.description" type="textarea" :rows="2" placeholder="목적지 업무 용도 설명" />
                </el-form-item>
            </el-form>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MapPin, Pencil, Trash2 } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import { deleteDestination, getDestinations, saveDestination } from './service/destinations.api'
import type { DestinationItem, DestinationType, SaveDestinationPayload } from './service/destinations.types'

const route = useRoute()
const loading = ref(false)
const destinations = ref<DestinationItem[]>([])
const selectedMapId = ref<number>(Number(route.query.mapId) || 1)
const selectedDestId = ref<number | null>(1)

const query = reactive<{ keyword: string; type?: DestinationType }>({
    keyword: '',
    type: undefined,
})

const mapOptions = [
    { id: 1, name: '처분용기 장입 실내 1층 도면' },
    { id: 2, name: '외곽 시설물 정밀 순찰 2D 지도' },
]

const typeOptions = [
    { label: '전체 타입', value: undefined },
    { label: '작업 지점', value: 'WORK_SPOT' },
    { label: '대기 지점', value: 'WAITING_SPOT' },
    { label: '충전소', value: 'CHARGING_STATION' },
    { label: '순찰 웨이포인트', value: 'PATROL_WAYPOINT' },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const formRef = ref()

const form = reactive<SaveDestinationPayload>({
    id: undefined,
    mapId: 1,
    name: '',
    code: '',
    type: 'WORK_SPOT',
    x: 10,
    y: 10,
    heading: 0,
    description: '',
    isActive: true,
})

const rules = {
    name: [{ required: true, message: '목적지 이름을 입력하세요.', trigger: 'blur' }],
    code: [{ required: true, message: '목적지 코드를 입력하세요.', trigger: 'blur' }],
}

const selectedMapName = computed(() => mapOptions.find(m => m.id === selectedMapId.value)?.name || '기본 지도')
const selectedDestName = computed(() => destinations.value.find(d => d.id === selectedDestId.value)?.name || '선택 안됨')

const typeLabel = (type: DestinationType) => {
    switch (type) {
        case 'WORK_SPOT':
            return '작업지점'
        case 'WAITING_SPOT':
            return '대기지점'
        case 'CHARGING_STATION':
            return '충전소'
        case 'PATROL_WAYPOINT':
            return '순찰인자'
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

const openCreateDialog = () => {
    dialogIsEdit.value = false
    form.id = undefined
    form.mapId = selectedMapId.value
    form.name = ''
    form.code = `DEST-${Date.now().toString().slice(-4)}`
    form.type = 'WORK_SPOT'
    form.x = 10
    form.y = 10
    form.heading = 0
    form.description = ''
    form.isActive = true
    dialogVisible.value = true
}

const openEditDialog = (row: DestinationItem) => {
    dialogIsEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveDestination(form)
            ElMessage.success(dialogIsEdit.value ? '목적지가 수정되었습니다.' : '신규 목적지가 등록되었습니다.')
            dialogVisible.value = false
            await handleSearch()
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
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

onMounted(() => {
    handleSearch()
})
</script>

<style scoped lang="scss">
.query-button {
    height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    white-space: nowrap;
}

.icon-svg {
    width: 18px;
    height: 18px;
}

.icon-action {
    width: 16px;
    height: 16px;
}

.destination-layout {
    display: flex;
    gap: 20px;
    flex: 1 1 auto;
    min-height: 0;
}

.destination-map-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--border-glass-color);
    background: #090c14;
    overflow: hidden;
}

.destination-map-header {
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-color--secondary);
    border-bottom: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.03);
}

.destination-map-canvas {
    flex: 1;
    position: relative;
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
