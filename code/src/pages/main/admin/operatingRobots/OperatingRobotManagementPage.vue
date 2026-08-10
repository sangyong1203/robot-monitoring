<template>
    <div class="management-page">
        <!-- 상단 검색 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="로봇 이름, 로봇 ID, 모델명 검색"
                width="320px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="query.isOperating"
                label="운영 상태"
                placeholder="운영 상태 선택"
                :list="statusOptions"
                optionLabel="label"
                optionValue="value"
                selectionWidth="150px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 메인 데이터 패널 -->
        <Panel class="management-page__panel" title="배치 운영 로봇 목록 (6종 7대)" :total="robots.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    신규 운영 로봇 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="robots"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column prop="name" label="운영 로봇 명칭" min-width="180" show-overflow-tooltip />

                <el-table-column prop="robotCode" label="로봇 식별 ID" width="160" align="center" />

                <el-table-column prop="modelName" label="연계 로봇 모델" min-width="200" show-overflow-tooltip />

                <el-table-column prop="manufacturer" label="제조사" width="140" align="center" />

                <el-table-column prop="orgPath" label="설치 기관 및 구역" min-width="220" show-overflow-tooltip />

                <el-table-column prop="communicationStatus" label="통신 상태" width="120" align="center">
                    <template #default="{ row }">
                        <StatusBadge
                            :label="row.communicationStatus === 'ONLINE' ? '정상' : row.communicationStatus === 'STALE' ? '지연' : '오프라인'"
                            :variant="row.communicationStatus === 'ONLINE' ? 'success' : row.communicationStatus === 'STALE' ? 'warning' : 'danger'"
                        />
                    </template>
                </el-table-column>

                <el-table-column prop="batteryPercent" label="배터리" width="110" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="`${row.batteryPercent}%`" :variant="row.batteryPercent > 20 ? 'info' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column prop="isOperating" label="운영 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isOperating ? '운영 중' : '미운영'" :variant="row.isOperating ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="작업" width="160" align="center" fixed="right">
                    <template #default="{ row }">
                        <div class="table-actions">
                            <el-button
                                class="table-actions__icon-button"
                                type="success"
                                text
                                title="관제 모니터링"
                                :disabled="!row.isOperating"
                                @click="goMonitoring(row)"
                            >
                                <el-icon><Tv /></el-icon>
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
        <OperatingRobotFormDialog
            v-model="dialogVisible"
            :is-edit="dialogIsEdit"
            :initial-data="selectedRobot"
            @saved="handleSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bot, Pencil, Trash2, Tv } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import OperatingRobotFormDialog from './components/OperatingRobotFormDialog.vue'
import { deleteOperatingRobot, getOperatingRobots } from './service/operatingRobots.api'
import type { OperatingRobotItem } from './service/operatingRobots.types'

const router = useRouter()
const loading = ref(false)
const robots = ref<OperatingRobotItem[]>([])

const query = reactive<{ keyword: string; isOperating?: boolean }>({
    keyword: '',
    isOperating: undefined,
})

const statusOptions = [
    { label: '전체 상태', value: undefined },
    { label: '운영 중', value: true },
    { label: '미운영', value: false },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const selectedRobot = ref<OperatingRobotItem | null>(null)

const handleSearch = async () => {
    loading.value = true
    try {
        robots.value = await getOperatingRobots(query)
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    dialogIsEdit.value = false
    selectedRobot.value = null
    dialogVisible.value = true
}

const openEditDialog = (row: OperatingRobotItem) => {
    dialogIsEdit.value = true
    selectedRobot.value = row
    dialogVisible.value = true
}

const confirmDelete = async (row: OperatingRobotItem) => {
    try {
        await ElMessageBox.confirm(
            `운영 로봇 '${row.name} (${row.robotCode})'을(를) 시스템에서 삭제하시겠습니까? 관련 이력이 함께 정리됩니다.`,
            '운영 로봇 삭제 확인',
            {
                confirmButtonText: '삭제',
                cancelButtonText: '취소',
                type: 'warning',
            },
        )
        await deleteOperatingRobot(row.id)
        ElMessage.success('운영 로봇이 삭제되었습니다.')
        await handleSearch()
    } catch {
        // Canceled
    }
}

const goMonitoring = (row: OperatingRobotItem) => {
    router.push({ path: '/main/integrated-monitoring', query: { robotId: row.id } })
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
