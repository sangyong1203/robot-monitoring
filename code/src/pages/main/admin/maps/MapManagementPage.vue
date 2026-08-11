<template>
    <div class="management-page">
        <!-- 상단 조회 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="지도 이름, 식별 코드, 구역명 검색"
                width="320px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="query.mapType"
                label="지도 구분"
                placeholder="지도 구분 선택"
                :list="typeOptions"
                optionLabel="label"
                optionValue="value"
                selectionWidth="150px"
                @onChange="handleSearch"
            />
            <DropdownList
                v-model="query.isActive"
                label="사용 여부"
                placeholder="사용 여부 선택"
                :list="statusOptions"
                optionLabel="label"
                optionValue="value"
                selectionWidth="150px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 카드 & 테이블 패널 -->
        <Panel class="management-page__panel" title="지도 목록" :total="maps.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    신규 지도 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="maps"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column label="2D 미리보기" width="110" align="center">
                    <template #default="{ row }">
                        <div class="map-thumbnail-preview">
                            <img :src="row.imageUrl || '/sample_map/map.png'" alt="지도 썸네일" />
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="name" label="지도 이름" min-width="200" show-overflow-tooltip />

                <el-table-column prop="code" label="지도 코드" width="160" align="center" />

                <el-table-column prop="zoneName" label="소속 구역" width="160" align="center" show-overflow-tooltip />

                <el-table-column prop="mapType" label="구분" width="130" align="center">
                    <template #default="{ row }">
                        <StatusBadge
                            :label="row.mapType === 'SITE_MAP' ? '종합 배치도' : row.mapType === 'INDOOR' ? '실내 지도' : '실외 지도'"
                            :variant="row.mapType === 'SITE_MAP' ? 'progress' : row.mapType === 'INDOOR' ? 'info' : 'warning'"
                        />
                    </template>
                </el-table-column>

                <el-table-column prop="resolution" label="해상도(m/px)" width="120" align="center" />

                <el-table-column prop="isActive" label="사용 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '사용' : '미사용'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="등록/수정 일시" width="180" align="center">
                    <template #default="{ row }">
                        <span>{{ formatDateTime(row.updatedAt) }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="작업" width="150" align="center" fixed="right">
                    <template #default="{ row }">
                        <div class="table-actions">
                            <el-button
                                class="table-actions__icon-button"
                                type="primary"
                                text
                                title="목적지 관리"
                                @click="goDestinations(row)"
                            >
                                <el-icon><MapPin /></el-icon>
                            </el-button>
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
        </Panel>

        <!-- 신규/수정 다이얼로그 컴포넌트 -->
        <MapFormDialog
            v-model="dialogVisible"
            :is-edit="dialogIsEdit"
            :initial-data="selectedMap"
            @saved="handleSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Map, MapPin, Pencil, Trash2 } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import MapFormDialog from './components/MapFormDialog.vue'
import { deleteMap, getMaps } from './service/maps.api'
import type { MapItem, MapType } from './service/maps.types'
import { formatDateTime } from '@/utils/date.util'

const router = useRouter()
const loading = ref(false)
const maps = ref<MapItem[]>([])

const query = reactive<{ keyword: string; mapType?: MapType; isActive?: boolean }>({
    keyword: '',
    mapType: undefined,
    isActive: undefined,
})

const typeOptions = [
    { label: '전체 지도', value: undefined },
    { label: '종합 배치도', value: 'SITE_MAP' },
    { label: '실내 지도', value: 'INDOOR' },
    { label: '실외 지도', value: 'OUTDOOR' },
]

const statusOptions = [
    { label: '전체 상태', value: undefined },
    { label: '사용', value: true },
    { label: '미사용', value: false },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const selectedMap = ref<MapItem | null>(null)

const handleSearch = async () => {
    loading.value = true
    try {
        maps.value = await getMaps(query)
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    dialogIsEdit.value = false
    selectedMap.value = null
    dialogVisible.value = true
}

const openEditDialog = (row: MapItem) => {
    dialogIsEdit.value = true
    selectedMap.value = row
    dialogVisible.value = true
}

const confirmDelete = async (row: MapItem) => {
    if (row.isPrimary) {
        ElMessageBox.alert('대표 지도는 삭제할 수 없습니다. 먼저 다른 지도를 대표 지도로 지정하세요.', '대표 지도 삭제 제한', {
            confirmButtonText: '확인',
            type: 'warning',
        })
        return
    }

    try {
        await ElMessageBox.confirm(`지도 '${row.name}'을(를) 삭제하시겠습니까?`, '지도 삭제 확인', {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
        })
        const res = await deleteMap(row.id)
        if (res.success) {
            ElMessage.success('지도가 삭제되었습니다.')
            await handleSearch()
        } else {
            ElMessage.error(res.message || '삭제 실패')
        }
    } catch {
        // Canceled
    }
}

const goDestinations = (row: MapItem) => {
    router.push({ path: '/admin/destinations', query: { mapId: row.id } })
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

.map-thumbnail-preview {
    width: 80px;
    height: 50px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-glass-color);
    background: #0f131d;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
