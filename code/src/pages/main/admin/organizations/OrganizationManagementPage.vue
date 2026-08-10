<template>
    <div class="management-page">
        <!-- 상단 검색 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="기관명, 코드, 담당자 검색"
                width="300px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="query.orgType"
                label="기관 구분"
                placeholder="기관 구분 선택"
                :list="orgTypeOptions"
                optionLabel="label"
                optionValue="value"
                selectionWidth="160px"
                @onChange="handleSearch"
            />
            <DropdownList
                v-model="query.isActive"
                label="운영 상태"
                placeholder="운영 상태 선택"
                :list="statusOptions"
                optionLabel="label"
                optionValue="value"
                selectionWidth="160px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 카드 및 테이블 패널 -->
        <Panel class="management-page__panel" title="기관 및 사이트 목록" :total="organizations.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    신규 기관 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="organizations"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column prop="name" label="기관 / 사이트명" min-width="220" show-overflow-tooltip />

                <el-table-column prop="code" label="기관 코드" width="160" align="center" />

                <el-table-column prop="orgType" label="구분" width="130" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="orgTypeLabel(row.orgType)" :variant="orgTypeVariant(row.orgType)" />
                    </template>
                </el-table-column>

                <el-table-column prop="activeRobotCount" label="운영 로봇" width="110" align="center" />

                <el-table-column prop="registeredUserCount" label="등록 사용자" width="110" align="center" />

                <el-table-column prop="vendorName" label="운영 관리 업체" width="160" align="center" show-overflow-tooltip />

                <el-table-column prop="vendorContactName" label="업체 담당자" width="130" align="center" />

                <el-table-column prop="isActive" label="운영 상태" width="110" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '운영 중' : '비활성'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="등록/수정 일시" width="160" align="center">
                    <template #default="{ row }">
                        <span>{{ formatDateTime(row.updatedAt) }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="작업" width="120" align="center" fixed="right">
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
        </Panel>

        <!-- 신규/수정 다이얼로그 컴포넌트 -->
        <OrganizationFormDialog
            v-model="dialogVisible"
            :is-edit="dialogIsEdit"
            :initial-data="selectedOrg"
            @saved="handleSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Building2, Pencil, Trash2 } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import OrganizationFormDialog from './components/OrganizationFormDialog.vue'
import { deleteOrganization, getOrganizations } from './service/organizations.api'
import type { OrganizationItem, OrgType } from './service/organizations.types'
import { formatDateTime } from '@/utils/date.util'

const loading = ref(false)
const organizations = ref<OrganizationItem[]>([])

const query = reactive<{ keyword: string; orgType?: OrgType; isActive?: boolean }>({
    keyword: '',
    orgType: undefined,
    isActive: undefined,
})

const orgTypeOptions = [
    { label: '전체 구분', value: undefined },
    { label: '대표 본원', value: 'HEADQUARTER' },
    { label: '운영 센터', value: 'CENTER' },
    { label: '세부 사이트', value: 'SITE' },
]

const statusOptions = [
    { label: '전체 상태', value: undefined },
    { label: '운영 중', value: true },
    { label: '비활성', value: false },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const selectedOrg = ref<OrganizationItem | null>(null)

const orgTypeLabel = (type: OrgType) => {
    switch (type) {
        case 'HEADQUARTER':
            return '대표 본원'
        case 'CENTER':
            return '운영 센터'
        case 'SITE':
            return '세부 사이트'
        default:
            return type
    }
}

const orgTypeVariant = (type: OrgType) => {
    switch (type) {
        case 'HEADQUARTER':
            return 'progress'
        case 'CENTER':
            return 'info'
        default:
            return 'muted'
    }
}

const handleSearch = async () => {
    loading.value = true
    try {
        organizations.value = await getOrganizations(query)
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    dialogIsEdit.value = false
    selectedOrg.value = null
    dialogVisible.value = true
}

const openEditDialog = (row: OrganizationItem) => {
    dialogIsEdit.value = true
    selectedOrg.value = row
    dialogVisible.value = true
}

const confirmDelete = async (row: OrganizationItem) => {
    if (row.isRepresentative) {
        ElMessageBox.alert('대표 본원 기관은 삭제할 수 없습니다.', '삭제 구한 제한', {
            confirmButtonText: '확인',
            type: 'warning',
        })
        return
    }

    try {
        await ElMessageBox.confirm(`기관 '${row.name}'을(를) 삭제하시겠습니까? 관련 하위 데이터가 영향받을 수 있습니다.`, '기관 삭제 확인', {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
        })
        await deleteOrganization(row.id)
        ElMessage.success('기관이 삭제되었습니다.')
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
</style>
