<template>
    <div class="management-page">
        <!-- 상단 검색 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <DropdownList
                v-model="selectedOrgId"
                label="소속 기관"
                :list="orgOptions"
                optionLabel="name"
                optionValue="id"
                width="280px"
                @onChange="handleSearch"
            />
            <DropdownList
                v-model="query.userLevel"
                label="사용자 등급"
                :list="levelOptions"
                optionLabel="label"
                optionValue="value"
                width="200px"
                @onChange="handleSearch"
            />
            <SearchText
                v-model="query.keyword"
                placeholder="ID, 이름, 연락처, 이메일 검색"
                width="300px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
        </SearchBox>

        <!-- 데이터 테이블 패널 -->
        <Panel class="management-page__panel" title="사용자 계정 목록" :total="users.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    <el-icon><UserPlus /></el-icon>
                    신규 사용자 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="users"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column prop="loginId" label="사용자 ID 및 이름" min-width="220">
                    <template #default="{ row }">
                        <strong style="color: var(--text-color--primary); font-size: 15px">{{ row.name }}</strong>
                        <div style="font-size: 12px; color: var(--text-color--body)">({{ row.loginId }})</div>
                    </template>
                </el-table-column>

                <el-table-column prop="userLevel" label="권한 등급" width="160" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="levelLabel(row.userLevel)" :variant="levelVariant(row.userLevel)" />
                    </template>
                </el-table-column>

                <el-table-column prop="orgPath" label="소속 기관 / 부서" min-width="240">
                    <template #default="{ row }">
                        <div style="color: var(--text-color--primary)">{{ row.orgPath }}</div>
                        <div style="font-size: 12px; color: var(--text-color--body)">{{ row.deptName }} · {{ row.position }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="phone" label="연락처 및 이메일" width="220">
                    <template #default="{ row }">
                        <div style="color: var(--text-color--primary)">{{ row.phone }}</div>
                        <div style="font-size: 12px; color: var(--text-color--body)">{{ row.email }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="isActive" label="계정 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '사용' : '잠금'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="최근 로그인" width="160" align="center">
                    <template #default="{ row }">
                        <div style="font-size: 12px; color: var(--text-color--primary)">{{ row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '기록 없음' }}</div>
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
            :title="dialogIsEdit ? '사용자 정보 수정' : '신규 사용자 등록'"
            description="시스템 사용자 계정 정보, 소속 기관, 권한 등급을 지정합니다."
            width="640px"
            :buttonTypes="['Cancel', 'Save']"
            @onSave="handleSave"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
                <el-form-item label="사용자 ID" prop="loginId">
                    <el-input v-model="form.loginId" :disabled="dialogIsEdit" placeholder="로그인 ID (영문/숫자)" />
                </el-form-item>

                <el-form-item label="사용자 성명" prop="name">
                    <el-input v-model="form.name" placeholder="성명 입력" />
                </el-form-item>

                <el-form-item label="비밀번호" prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        show-password
                        :placeholder="dialogIsEdit ? '변경 시에만 입력하세요' : '비밀번호 입력'"
                    />
                </el-form-item>

                <el-form-item label="권한 등급" prop="userLevel">
                    <el-select v-model="form.userLevel" style="width: 100%">
                        <el-option label="수퍼 관리자 (SUPER_ADMIN)" value="SUPER_ADMIN" />
                        <el-option label="시스템 관리자 (SYSTEM_ADMIN)" value="SYSTEM_ADMIN" />
                        <el-option label="관제 자율 조종사 (CONTROL_OPERATOR)" value="CONTROL_OPERATOR" />
                        <el-option label="현장지원 엔지니어 (FIELD_SUPPORT)" value="FIELD_SUPPORT" />
                        <el-option label="일반 뷰어 (VIEWER)" value="VIEWER" />
                    </el-select>
                </el-form-item>

                <el-form-item label="소속 기관" prop="orgId">
                    <el-select v-model="form.orgId" style="width: 100%" @change="handleOrgChange">
                        <el-option v-for="org in orgOptions" :key="org.id" :label="org.name" :value="org.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="부서명">
                    <el-input v-model="form.deptName" placeholder="예: 방사선관제팀" />
                </el-form-item>

                <el-form-item label="직급 / 직책">
                    <el-input v-model="form.position" placeholder="예: 선임연구원" />
                </el-form-item>

                <el-form-item label="연락처" prop="phone">
                    <el-input v-model="form.phone" placeholder="예: 010-1234-5678" />
                </el-form-item>

                <el-form-item label="이메일 주소" prop="email" style="grid-column: span 2">
                    <el-input v-model="form.email" placeholder="example@korad.or.kr" />
                </el-form-item>

                <el-form-item label="알림 수신 및 계정 상태" style="grid-column: span 2">
                    <div style="display: flex; gap: 24px">
                        <el-checkbox v-model="form.receiveSmsAlarm">긴급 알람 SMS 수신</el-checkbox>
                        <el-checkbox v-model="form.receiveEmailAlarm">이메일 보고서 수신</el-checkbox>
                        <el-checkbox v-model="form.isActive">계정 활성화 상태</el-checkbox>
                    </div>
                </el-form-item>
            </el-form>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Pencil, Trash2, UserPlus } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import { deleteUser, getUsers, saveUser } from './service/users.api'
import type { SaveUserPayload, UserItem } from './service/users.types'
import type { UserLevel } from '@/types/enums'
import { formatDateTime } from '@/utils/date.util'

const loading = ref(false)
const users = ref<UserItem[]>([])
const selectedOrgId = ref<number | undefined>(1)

const query = reactive<{ userLevel: UserLevel | undefined; keyword: string; isActive: boolean | undefined }>({
    userLevel: undefined,
    keyword: '',
    isActive: undefined,
})

const orgOptions = [
    { id: 1, name: 'KORAD 경주 본원' },
    { id: 2, name: 'KORAD 경주 본원 > 처분시설 운영센터' },
    { id: 3, name: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소' },
]

const levelOptions = [
    { label: '전체 등급', value: undefined },
    { label: '수퍼 관리자', value: 'SUPER_ADMIN' },
    { label: '시스템 관리자', value: 'SYSTEM_ADMIN' },
    { label: '관제 조종사', value: 'CONTROL_OPERATOR' },
    { label: '현장 지원팀', value: 'FIELD_SUPPORT' },
    { label: '뷰어', value: 'VIEWER' },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const formRef = ref()

const form = reactive<SaveUserPayload>({
    id: undefined,
    loginId: '',
    name: '',
    userLevel: 'CONTROL_OPERATOR',
    orgId: 2,
    orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
    deptName: '',
    position: '',
    phone: '',
    email: '',
    receiveSmsAlarm: true,
    receiveEmailAlarm: true,
    isActive: true,
    password: '',
})

const rules = {
    loginId: [{ required: true, message: '사용자 ID를 입력하세요.', trigger: 'blur' }],
    name: [{ required: true, message: '성명을 입력하세요.', trigger: 'blur' }],
    email: [{ required: true, message: '이메일을 입력하세요.', trigger: 'blur' }],
}

const levelLabel = (level: UserLevel) => {
    switch (level) {
        case 'SUPER_ADMIN':
            return '수퍼 관리자'
        case 'SYSTEM_ADMIN':
            return '시스템 관리자'
        case 'CONTROL_OPERATOR':
            return '관제 조종사'
        case 'FIELD_SUPPORT':
            return '현장지원 엔지니어'
        case 'VIEWER':
            return '뷰어'
        default:
            return level
    }
}

const levelVariant = (level: UserLevel) => {
    switch (level) {
        case 'SUPER_ADMIN':
            return 'progress'
        case 'SYSTEM_ADMIN':
            return 'info'
        case 'CONTROL_OPERATOR':
            return 'success'
        case 'FIELD_SUPPORT':
            return 'warning'
        default:
            return 'muted'
    }
}

const handleOrgChange = (orgId: number) => {
    const found = orgOptions.find(o => o.id === orgId)
    if (found) {
        form.orgPath = found.name
    }
}

const handleSearch = async () => {
    loading.value = true
    try {
        users.value = await getUsers({
            orgId: selectedOrgId.value,
            userLevel: query.userLevel,
            keyword: query.keyword,
            isActive: query.isActive,
        })
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    dialogIsEdit.value = false
    form.id = undefined
    form.loginId = ''
    form.name = ''
    form.userLevel = 'CONTROL_OPERATOR'
    form.orgId = 2
    handleOrgChange(2)
    form.deptName = '방사선관제팀'
    form.position = '선임연구원'
    form.phone = ''
    form.email = ''
    form.receiveSmsAlarm = true
    form.receiveEmailAlarm = true
    form.isActive = true
    form.password = '123456'
    dialogVisible.value = true
}

const openEditDialog = (row: UserItem) => {
    dialogIsEdit.value = true
    Object.assign(form, row)
    form.password = ''
    dialogVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveUser(form)
            ElMessage.success(dialogIsEdit.value ? '사용자 정보가 수정되었습니다.' : '신규 사용자가 등록되었습니다.')
            dialogVisible.value = false
            await handleSearch()
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}

const confirmDelete = async (row: UserItem) => {
    try {
        await ElMessageBox.confirm(`사용자 '${row.name} (${row.loginId})' 계정을 삭제하시겠습니까?`, '사용자 삭제 확인', {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
        })
        await deleteUser(row.id)
        ElMessage.success('사용자 계정이 삭제되었습니다.')
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
