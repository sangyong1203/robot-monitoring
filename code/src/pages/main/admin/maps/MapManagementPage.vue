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
                :list="typeOptions"
                optionLabel="label"
                optionValue="value"
                width="200px"
                @onChange="handleSearch"
            />
            <DropdownList
                v-model="query.isActive"
                label="사용 여부"
                :list="statusOptions"
                optionLabel="label"
                optionValue="value"
                width="180px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 카드 & 테이블 패널 -->
        <Panel class="management-page__panel" title="지역 / 구역 / 지도 목록" :total="maps.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    <el-icon><Map /></el-icon>
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

                <el-table-column prop="mapType" label="구분" width="110" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.mapType === 'INDOOR' ? '실내 지도' : '실외 지도'" :variant="row.mapType === 'INDOOR' ? 'info' : 'warning'" />
                    </template>
                </el-table-column>

                <el-table-column prop="resolution" label="해상도(m/px)" width="120" align="center" />

                <el-table-column prop="isActive" label="사용 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '사용' : '미사용'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="등록/수정 일시" width="160" align="center">
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

        <!-- 신규/수정 다이얼로그 -->
        <BaseDialog
            v-model="dialogVisible"
            :title="dialogIsEdit ? '지도 정보 수정' : '신규 지도 등록'"
            description="2D 공간 도면 파일과 좌표 해상도 및 대표 지도 설정을 지정합니다."
            width="680px"
            :buttonTypes="['Cancel', 'Save']"
            @onSave="handleSave"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
                <el-form-item label="지도 이름" prop="name">
                    <el-input v-model="form.name" placeholder="예: 처분용기 장입 실내 1층 도면" />
                </el-form-item>

                <el-form-item label="지도 식별 코드" prop="code">
                    <el-input v-model="form.code" placeholder="예: MAP-INDOOR-01" />
                </el-form-item>

                <el-form-item label="소속 지역 / 구역" prop="zoneName">
                    <el-input v-model="form.zoneName" placeholder="구역 명칭 입력" />
                </el-form-item>

                <el-form-item label="지도 구분" prop="mapType">
                    <el-select v-model="form.mapType" style="width: 100%">
                        <el-option label="실내 지도 (INDOOR)" value="INDOOR" />
                        <el-option label="실외 지도 (OUTDOOR)" value="OUTDOOR" />
                    </el-select>
                </el-form-item>

                <el-form-item label="지도 픽셀 가로(Width)" prop="width">
                    <el-input-number v-model="form.width" :min="100" :max="10000" style="width: 100%" />
                </el-form-item>

                <el-form-item label="지도 픽셀 세로(Height)" prop="height">
                    <el-input-number v-model="form.height" :min="100" :max="10000" style="width: 100%" />
                </el-form-item>

                <el-form-item label="좌표 해상도 (m/px)" prop="resolution">
                    <el-input-number v-model="form.resolution" :precision="3" :step="0.01" :min="0.001" style="width: 100%" />
                </el-form-item>

                <el-form-item label="원점 좌표 (Origin X, Y)" style="grid-column: span 1">
                    <div style="display: flex; gap: 8px">
                        <el-input-number v-model="form.origin_x" placeholder="X" style="width: 50%" />
                        <el-input-number v-model="form.origin_y" placeholder="Y" style="width: 50%" />
                    </div>
                </el-form-item>

                <el-form-item label="지도 사용 및 대표 설정" style="grid-column: span 2">
                    <div style="display: flex; gap: 24px">
                        <el-checkbox v-model="form.isPrimary">통합관제 대표 지도로 설정</el-checkbox>
                        <el-checkbox v-model="form.isActive">지도 활성화 사용</el-checkbox>
                    </div>
                </el-form-item>

                <el-form-item label="지도 설명" style="grid-column: span 2">
                    <el-input v-model="form.description" type="textarea" :rows="2" placeholder="지도 용도 및 구역 설명 입력" />
                </el-form-item>
            </el-form>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Map, MapPin, Pencil, Trash2 } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import { deleteMap, getMaps, saveMap } from './service/maps.api'
import type { MapItem, MapType, SaveMapPayload } from './service/maps.types'
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
const formRef = ref()

const form = reactive<SaveMapPayload>({
    id: undefined,
    code: '',
    name: '',
    mapType: 'INDOOR',
    orgName: '중저준위 처분시설 운영센터',
    regionName: 'KORAD 경주 본원',
    zoneName: '실내 처분용기 장입구역',
    fileName: 'map.png',
    fileSize: 4500000,
    imageUrl: '/sample_map/map.png',
    width: 1200,
    height: 800,
    resolution: 0.05,
    originX: 0,
    originY: 0,
    origin_x: 0,
    origin_y: 0,
    isPrimary: false,
    isActive: true,
    description: '',
    registeredByName: '관리자',
})

const rules = {
    name: [{ required: true, message: '지도 이름을 입력하세요.', trigger: 'blur' }],
    code: [{ required: true, message: '지도 코드를 입력하세요.', trigger: 'blur' }],
}

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
    form.id = undefined
    form.name = ''
    form.code = `MAP-${Date.now().toString().slice(-4)}`
    form.mapType = 'INDOOR'
    form.width = 1200
    form.height = 800
    form.resolution = 0.05
    form.origin_x = 0
    form.origin_y = 0
    form.isPrimary = false
    form.isActive = true
    form.description = ''
    dialogVisible.value = true
}

const openEditDialog = (row: MapItem) => {
    dialogIsEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            form.originX = form.origin_x
            form.originY = form.origin_y
            await saveMap(form)
            ElMessage.success(dialogIsEdit.value ? '지도 정보가 수정되었습니다.' : '신규 지도가 등록되었습니다.')
            dialogVisible.value = false
            await handleSearch()
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
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

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
