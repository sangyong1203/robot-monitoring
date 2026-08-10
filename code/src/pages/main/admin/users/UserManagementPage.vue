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
                <el-table-column prop="name" label="사용자 이름" width="140" align="center" />

                <el-table-column prop="loginId" label="사용자 ID" width="150" align="center" />

                <el-table-column prop="userLevel" label="권한 등급" width="160" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="levelLabel(row.userLevel)" :variant="levelVariant(row.userLevel)" />
                    </template>
                </el-table-column>

                <el-table-column prop="orgPath" label="소속 기관 / 부서" min-width="240" show-overflow-tooltip />

                <el-table-column prop="phone" label="연락처" width="150" align="center" />

                <el-table-column prop="email" label="이메일 주소" width="200" align="center" show-overflow-tooltip />

                <el-table-column prop="isActive" label="계정 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '사용' : '잠금'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="최근 로그인" width="160" align="center">
                    <template #default="{ row }">
                        <span>{{ row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '기록 없음' }}</span>
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
        <UserFormDialog
            v-model="dialogVisible"
            :is-edit="dialogIsEdit"
            :initial-data="selectedUser"
            @saved="handleSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Pencil, Trash2, UserPlus } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import { deleteUser, getUsers } from './service/users.api'
import type { UserItem } from './service/users.types'
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
const selectedUser = ref<UserItem | null>(null)

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
    selectedUser.value = null
    dialogVisible.value = true
}

const openEditDialog = (row: UserItem) => {
    dialogIsEdit.value = true
    selectedUser.value = row
    dialogVisible.value = true
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
