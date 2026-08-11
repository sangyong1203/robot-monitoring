<template>
    <div class="mission-management-page">
        <Panel title="미션 및 임무 관리" subtitle="Activity, Task, 융합 Mission 및 스케줄 선행 조건 관리">
            <el-tabs v-model="activeTab" class="mission-tabs">
                <el-tab-pane label="융합 Mission 관리" name="missions">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="미션 이름 / 코드 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openMissionDialog">신규 융합 Mission 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredMissions" stripe style="width: 100%">
                        <el-table-column prop="code" label="미션 코드" width="180" />
                        <el-table-column prop="name" label="미션 이름" min-width="220" />
                        <el-table-column label="미션 유형" width="130">
                            <template #default="{ row }">
                                <StatusBadge
                                    :label="row.missionType === 'CONVERGENCE' ? '융합 미션' : '단일 미션'"
                                    :variant="row.missionType === 'CONVERGENCE' ? 'warning' : 'info'"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column label="포함 Task 수" width="110">
                            <template #default="{ row }">
                                {{ row.tasks.length }}개
                            </template>
                        </el-table-column>
                        <el-table-column label="연계 조건 수" width="110">
                            <template #default="{ row }">
                                {{ row.conditions.length }}개
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="설명" min-width="200" show-overflow-tooltip />
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                        <el-table-column label="관리" width="120" align="center">
                            <template #default="{ row }">
                                <TableRowActions
                                    :show-edit="true"
                                    :show-delete="true"
                                    @edit="editMission(row)"
                                    @delete="deleteMission(row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="Task 관리" name="tasks">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="Task 이름 / 코드 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openTaskDialog">신규 Task 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredTasks" stripe style="width: 100%">
                        <el-table-column prop="code" label="Task 코드" width="180" />
                        <el-table-column prop="name" label="Task 이름" min-width="200" />
                        <el-table-column prop="robotModelName" label="대상 로봇 모델" width="150" />
                        <el-table-column label="포함 Activity" min-width="240">
                            <template #default="{ row }">
                                <span v-for="act in row.activities" :key="act.sequence" class="task-act-tag">
                                    {{ act.sequence }}. {{ act.activityName }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="Activity 관리" name="activities">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="Activity 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openActivityDialog">신규 Activity 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredActivities" stripe style="width: 100%">
                        <el-table-column prop="code" label="Activity 코드" width="180" />
                        <el-table-column prop="name" label="Activity 이름" min-width="200" />
                        <el-table-column prop="activityType" label="유형" width="120" />
                        <el-table-column prop="description" label="설명" min-width="240" />
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </Panel>

        <!-- Mission Form Dialog -->
        <BaseDialog
            v-model="missionDialogVisible"
            title="융합 Mission 등록 / 수정"
            width="650px"
        >
            <el-form label-position="top">
                <el-form-item label="미션 코드" required>
                    <el-input v-model="missionForm.code" placeholder="예: MIS-FUSED-01" />
                </el-form-item>
                <el-form-item label="미션 이름" required>
                    <el-input v-model="missionForm.name" placeholder="예: [융합] 폐기물 이송 및 장입 미션" />
                </el-form-item>
                <el-form-item label="미션 유형" required>
                    <el-radio-group v-model="missionForm.missionType">
                        <el-radio-button value="CONVERGENCE">2종 이상 이기종 융합 미션</el-radio-button>
                        <el-radio-button value="SINGLE">단일 로봇 미션</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="미션 설명">
                    <el-input v-model="missionForm.description" type="textarea" :rows="3" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="missionDialogVisible = false">취소</el-button>
                <el-button type="primary" @click="saveMission">저장</el-button>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Panel from '@/components/Panel.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import SearchText from '@/components/SearchText.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TableRowActions from '@/components/TableRowActions.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, getTasks, getMissions } from './service/missionManagement.api'
import type { ActivityItem, TaskItem, MissionItem } from './service/missionManagement.types'

const activeTab = ref('missions')
const searchQuery = ref('')

const activities = ref<ActivityItem[]>([])
const tasks = ref<TaskItem[]>([])
const missions = ref<MissionItem[]>([])

const missionDialogVisible = ref(false)
const missionForm = ref({
    code: '',
    name: '',
    missionType: 'CONVERGENCE' as 'SINGLE' | 'CONVERGENCE',
    description: '',
})

const loadData = async () => {
    const actRes = await getActivities()
    const taskRes = await getTasks()
    const misRes = await getMissions()

    activities.value = actRes.data ?? []
    tasks.value = taskRes.data ?? []
    missions.value = misRes.data ?? []
}

onMounted(() => {
    void loadData()
})

const filteredMissions = computed(() => {
    if (!searchQuery.value.trim()) return missions.value
    const q = searchQuery.value.toLowerCase()
    return missions.value.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q))
})

const filteredTasks = computed(() => {
    if (!searchQuery.value.trim()) return tasks.value
    const q = searchQuery.value.toLowerCase()
    return tasks.value.filter(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
})

const filteredActivities = computed(() => {
    if (!searchQuery.value.trim()) return activities.value
    const q = searchQuery.value.toLowerCase()
    return activities.value.filter(a => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
})

const onSearch = () => {
    // Search computed dynamically
}

const openMissionDialog = () => {
    missionForm.value = {
        code: `MIS-CONV-0${missions.value.length + 1}`,
        name: '',
        missionType: 'CONVERGENCE',
        description: '',
    }
    missionDialogVisible.value = true
}

const openTaskDialog = () => {
    ElMessage.info('Task 신규 등록 창이 열립니다.')
}

const openActivityDialog = () => {
    ElMessage.info('Activity 신규 등록 창이 열립니다.')
}

const saveMission = () => {
    if (!missionForm.value.name.trim() || !missionForm.value.code.trim()) {
        ElMessage.warning('미션 코드와 이름을 입력하세요.')
        return
    }
    missions.value.unshift({
        id: Date.now(),
        code: missionForm.value.code,
        name: missionForm.value.name,
        missionType: missionForm.value.missionType,
        description: missionForm.value.description,
        tasks: [],
        conditions: [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    })
    missionDialogVisible.value = false
    ElMessage.success('신규 융합 미션이 등록되었습니다.')
}

const editMission = (row: MissionItem) => {
    ElMessage.info(`${row.name} 미션 편집`)
}

const deleteMission = async (row: MissionItem) => {
    try {
        await ElMessageBox.confirm(`[${row.name}] 미션을 삭제하시겠습니까?`, '삭제 확인', { type: 'warning' })
        missions.value = missions.value.filter(m => m.id !== row.id)
        ElMessage.success('미션이 삭제되었습니다.')
    } catch {
        // Cancelled
    }
}
</script>

<style scoped lang="scss">
.mission-management-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.task-act-tag {
    display: inline-block;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 6px;
    margin-bottom: 4px;
    font-size: 13px;
}
</style>
