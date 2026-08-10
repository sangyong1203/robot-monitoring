<template>
    <div class="management-page">
        <!-- 상단 조회 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="기관/사이트 이름, 식별 코드 검색"
                width="320px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="query.orgType"
                label="기관 구분"
                :list="orgTypeOptions"
                optionLabel="label"
                optionValue="value"
                width="200px"
                @onChange="handleSearch"
            />
            <DropdownList
                v-model="query.isActive"
                label="운영 상태"
                :list="statusOptions"
                optionLabel="label"
                optionValue="value"
                width="180px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 카드 및 테이블 패널 -->
        <Panel class="management-page__panel" title="기관 및 사이트 목록" :total="organizations.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    <el-icon><Building2 /></el-icon>
                    신규 기관 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="organizations"
                row-key="id"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column prop="name" label="기관 / 사이트명" min-width="240">
                    <template #default="{ row }">
                        <div style="display: flex; align-items: center; gap: 8px">
                            <strong style="color: var(--text-color--primary); font-size: 15px">{{ row.name }}</strong>
                            <StatusBadge v-if="row.isRepresentative" label="대표 기관" variant="progress" />
                        </div>
                        <div style="font-size: 12px; color: var(--text-color--muted); margin-top: 4px">
                            코드: {{ row.code }} | 경로: {{ row.fullPath || row.name }}
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="orgType" label="구분" width="130" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="orgTypeLabel(row.orgType)" :variant="orgTypeVariant(row.orgType)" />
                    </template>
                </el-table-column>

                <el-table-column prop="activeRobotCount" label="운영 로봇" width="110" align="center">
                    <template #default="{ row }">
                        <strong style="color: var(--secondary-color)">{{ row.activeRobotCount }} 대</strong>
                    </template>
                </el-table-column>

                <el-table-column prop="registeredUserCount" label="등록 사용자" width="110" align="center">
                    <template #default="{ row }">
                        <span>{{ row.registeredUserCount }} 명</span>
                    </template>
                </el-table-column>

                <el-table-column prop="vendorName" label="운영 관리 업체" width="160">
                    <template #default="{ row }">
                        <div>{{ row.vendorName || '-' }}</div>
                        <div v-if="row.vendorContactName" style="font-size: 12px; color: var(--text-color--muted)">
                            {{ row.vendorContactName }} ({{ row.vendorContactDept || '' }})
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="isActive" label="운영 상태" width="110" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '운영 중' : '비활성'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="등록/수정 일시" width="170" align="center">
                    <template #default="{ row }">
                        <div style="font-size: 12px">{{ formatDateTime(row.updatedAt) }}</div>
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

        <!-- 신규/수정 다이얼로그 -->
        <BaseDialog
            v-model="dialogVisible"
            :title="dialogIsEdit ? '기관 / 사이트 정보 수정' : '신규 기관 / 사이트 등록'"
            description="통합관제 대상 기관 및 사이트 조직 정보를 설정합니다."
            width="640px"
            :buttonTypes="['Cancel', 'Save']"
            @onSave="handleSave"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
                <el-form-item label="기관 / 사이트명" prop="name">
                    <el-input v-model="form.name" placeholder="예: 중저준위 처분시설 운영센터" />
                </el-form-item>

                <el-form-item label="기관 식별 코드" prop="code">
                    <el-input v-model="form.code" placeholder="예: KORAD-CENTER-01" />
                </el-form-item>

                <el-form-item label="기관 구분" prop="orgType">
                    <el-select v-model="form.orgType" style="width: 100%">
                        <el-option label="대표 본원 (HEADQUARTER)" value="HEADQUARTER" />
                        <el-option label="운영 센터 (CENTER)" value="CENTER" />
                        <el-option label="세부 사이트 (SITE)" value="SITE" />
                    </el-select>
                </el-form-item>

                <el-form-item label="상위 기관 계층">
                    <el-select v-model="form.parentId" style="width: 100%" clearable placeholder="최상위 대표 기관인 경우 선택 해제">
                        <el-option v-for="org in parentOrgOptions" :key="org.id" :label="org.name" :value="org.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="운영 관리 업체명">
                    <el-input v-model="form.vendorName" placeholder="예: (주)한국방사성폐기물관리기술" />
                </el-form-item>

                <el-form-item label="업체 담당자명">
                    <el-input v-model="form.vendorContactName" placeholder="담당자 이름 입력" />
                </el-form-item>

                <el-form-item label="담당자 연락처">
                    <el-input v-model="form.vendorContactPhone" placeholder="예: 054-700-1199" />
                </el-form-item>

                <el-form-item label="담당자 이메일">
                    <el-input v-model="form.vendorContactEmail" placeholder="example@korad.or.kr" />
                </el-form-item>

                <el-form-item label="상태 설정" style="grid-column: span 2">
                    <div style="display: flex; gap: 24px">
                        <el-checkbox v-model="form.isRepresentative">대표 본원 기관으로 설정</el-checkbox>
                        <el-checkbox v-model="form.isActive">운영 활성화 상태</el-checkbox>
                    </div>
                </el-form-item>

                <el-form-item label="비고 및 기관 설명" style="grid-column: span 2">
                    <el-input v-model="form.description" type="textarea" :rows="2" placeholder="기관 업무 설명 및 특이사항 입력" />
                </el-form-item>
            </el-form>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Building2, Pencil, Trash2 } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import { deleteOrganization, getOrganizations, saveOrganization } from './service/organizations.api'
import type { OrganizationItem, OrgType, SaveOrgPayload } from './service/organizations.types'
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

const parentOrgOptions = [
    { id: 1, name: 'KORAD 경주 본원' },
    { id: 2, name: '중저준위 처분시설 운영센터' },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const formRef = ref()

const form = reactive<SaveOrgPayload>({
    id: undefined,
    code: '',
    name: '',
    orgType: 'SITE',
    parentId: undefined,
    isRepresentative: false,
    isActive: true,
    description: '',
    vendorName: '',
    vendorContactName: '',
    vendorContactDept: '',
    vendorContactPhone: '',
    vendorContactEmail: '',
})

const rules = {
    name: [{ required: true, message: '기관/사이트명을 입력하세요.', trigger: 'blur' }],
    code: [{ required: true, message: '기관 식별 코드를 입력하세요.', trigger: 'blur' }],
}

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
        case 'SITE':
            return 'muted'
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
    form.id = undefined
    form.name = ''
    form.code = `KORAD-SITE-${Date.now().toString().slice(-4)}`
    form.orgType = 'SITE'
    form.parentId = 2
    form.isRepresentative = false
    form.isActive = true
    form.description = ''
    form.vendorName = ''
    form.vendorContactName = ''
    dialogVisible.value = true
}

const openEditDialog = (row: OrganizationItem) => {
    dialogIsEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveOrganization(form)
            ElMessage.success(dialogIsEdit.value ? '기관 정보가 수정되었습니다.' : '신규 기관이 등록되었습니다.')
            dialogVisible.value = false
            await handleSearch()
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}

const confirmDelete = async (row: OrganizationItem) => {
    if (row.isRepresentative) {
        ElMessageBox.alert('대표 본원 기관은 삭제할 수 없습니다.', '삭제 제한', {
            confirmButtonText: '확인',
            type: 'warning',
        })
        return
    }

    try {
        await ElMessageBox.confirm(`기관 '${row.name}'을(를) 삭제하시겠습니까?`, '기관 삭제 확인', {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
        })
        const res = await deleteOrganization(row.id)
        if (res.success) {
            ElMessage.success('기관이 삭제되었습니다.')
            await handleSearch()
        } else {
            ElMessage.error(res.message || '삭제 실패')
        }
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
