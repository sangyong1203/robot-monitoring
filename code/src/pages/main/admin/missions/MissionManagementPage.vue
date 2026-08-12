<template>
    <div class="management-page">
        <Panel class="management-page__panel" title="미션 및 스케줄 관리" subtitle="Activity, Task, Mission 및 자동 수행 스케줄 관리" fill>
            <el-tabs v-model="activeTab" class="mission-tabs">
                <!-- 1. Mission 관리 탭 -->
                <el-tab-pane label="Mission 관리" name="missions">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="미션 이름 / 코드 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openMissionDialog()">신규 Mission 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredMissions" stripe style="width: 100%" height="100%">
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
                        <el-table-column prop="createdAt" label="등록일시" width="180" />
                        <el-table-column label="관리" width="120" align="center">
                            <template #default="{ row }">
                                <TableRowActions
                                    :show-edit="true"
                                    :show-delete="true"
                                    @edit="openMissionDialog(row)"
                                    @delete="deleteMission(row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 2. Task 관리 탭 -->
                <el-tab-pane label="Task 관리" name="tasks">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="Task 이름 / 코드 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openTaskDialog()">신규 Task 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredTasks" stripe style="width: 100%" height="100%">
                        <el-table-column prop="code" label="Task 코드" width="160" />
                        <el-table-column prop="name" label="Task 이름" min-width="180" />
                        <el-table-column prop="robotModelName" label="대상 로봇 모델" width="140" />
                        <el-table-column label="연동 목적지 (POI)" min-width="180">
                            <template #default="{ row }">
                                <StatusBadge :label="row.destinationName || '지정 안됨'" variant="progress" />
                            </template>
                        </el-table-column>
                        <el-table-column label="포함 Activity" min-width="240">
                            <template #default="{ row }">
                                <el-tooltip v-if="row.activities && row.activities.length" placement="top" effect="dark" :show-after="100">
                                    <template #content>
                                        <div class="act-tooltip-container">
                                            <div class="act-tooltip-title">포함 Activity 순서 목록 (총 {{ row.activities.length }}개)</div>
                                            <div v-for="act in row.activities" :key="act.sequence" class="act-tooltip-row">
                                                <span class="seq">{{ act.sequence }}.</span>
                                                <span class="name">{{ act.activityName }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <div class="task-act-tags-wrapper">
                                        <span
                                            v-for="act in row.activities.slice(0, 2)"
                                            :key="act.sequence"
                                            class="task-act-tag"
                                        >
                                            {{ act.sequence }}. {{ act.activityName }}
                                        </span>
                                        <span v-if="row.activities.length > 2" class="task-act-more">
                                            +{{ row.activities.length - 2 }}
                                        </span>
                                    </div>
                                </el-tooltip>
                                <span v-else class="text-muted">-</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                        <el-table-column label="관리" width="120" align="center">
                            <template #default="{ row }">
                                <TableRowActions
                                    :show-edit="true"
                                    :show-delete="true"
                                    @edit="openTaskDialog(row)"
                                    @delete="deleteTask(row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 3. Activity 관리 탭 -->
                <el-tab-pane label="Activity 관리" name="activities">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="Activity 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openActivityDialog()">신규 Activity 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredActivities" stripe style="width: 100%" height="100%">
                        <el-table-column prop="code" label="Activity 코드" width="180" />
                        <el-table-column prop="name" label="Activity 이름" min-width="180" />
                        <el-table-column prop="activityType" label="유형" width="120" />
                        <el-table-column label="대상 로봇 모델" width="140">
                            <template #default="{ row }">
                                {{ row.targetRobotModelName || '전역/전체' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="대상 목적지 (POI)" min-width="200">
                            <template #default="{ row }">
                                <StatusBadge :label="row.destinationName || '전역/미지정'" variant="success" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="설명" min-width="200" />
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                        <el-table-column label="관리" width="120" align="center">
                            <template #default="{ row }">
                                <TableRowActions
                                    :show-edit="true"
                                    :show-delete="true"
                                    @edit="openActivityDialog(row)"
                                    @delete="deleteActivity(row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 4. 스케줄 관리 탭 -->
                <el-tab-pane label="자동 실행 스케줄 관리" name="schedules">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="스케줄 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openScheduleDialog()">신규 스케줄 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredSchedules" stripe style="width: 100%" height="100%">
                        <el-table-column prop="code" label="스케줄 코드" width="150" />
                        <el-table-column prop="name" label="스케줄 명칭" min-width="200" />
                        <el-table-column prop="missionName" label="실행 대상 미션" min-width="220" />
                        <el-table-column prop="robotName" label="배정 로봇" width="180" />
                        <el-table-column prop="cronExpression" label="실행 주기/Cron" width="150" align="center" />
                        <el-table-column prop="nextRunAt" label="다음 실행 예정" width="170" align="center" />
                        <el-table-column label="상태" width="100" align="center">
                            <template #default="{ row }">
                                <el-switch v-model="row.isActive" @change="toggleScheduleActive(row)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="관리" width="120" align="center">
                            <template #default="{ row }">
                                <TableRowActions
                                    :show-edit="true"
                                    :show-delete="true"
                                    @edit="openScheduleDialog(row)"
                                    @delete="deleteSchedule(row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </Panel>

        <!-- Separated Form Dialogs -->
        <MissionFormDialog
            v-model:visible="missionDialogVisible"
            :editing-item="editingMission"
            :tasks="tasks"
            :next-code-number="missions.length + 1"
            @save="onSaveMission"
        />

        <TaskFormDialog
            v-model:visible="taskDialogVisible"
            :editing-item="editingTask"
            :activities="activities"
            :destinations="destinations"
            :next-code-number="tasks.length + 1"
            @save="onSaveTask"
        />

        <ActivityFormDialog
            v-model:visible="activityDialogVisible"
            :editing-item="editingActivity"
            :destinations="destinations"
            :next-code-number="activities.length + 1"
            @save="onSaveActivity"
        />

        <ScheduleFormDialog
            v-model:visible="scheduleDialogVisible"
            :editing-item="editingSchedule"
            :missions="missions"
            @save="onSaveSchedule"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Panel from '@/components/Panel.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import SearchText from '@/components/SearchText.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TableRowActions from '@/components/TableRowActions.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, getTasks, getMissions, getSchedules } from './service/missionManagement.api'
import type { ActivityItem, TaskItem, MissionItem, ScheduleItem, ActivityType } from './service/missionManagement.types'
import { fetchMockDestinations } from '../destinations/service/destinations.mock'
import type { DestinationItem } from '../destinations/service/destinations.types'

import MissionFormDialog from './components/MissionFormDialog.vue'
import TaskFormDialog from './components/TaskFormDialog.vue'
import ActivityFormDialog from './components/ActivityFormDialog.vue'
import ScheduleFormDialog from './components/ScheduleFormDialog.vue'

const activeTab = ref('missions')
const searchQuery = ref('')

const activities = ref<ActivityItem[]>([])
const tasks = ref<TaskItem[]>([])
const missions = ref<MissionItem[]>([])
const schedules = ref<ScheduleItem[]>([])
const destinations = ref<DestinationItem[]>([])

const missionDialogVisible = ref(false)
const taskDialogVisible = ref(false)
const activityDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)

const editingMission = ref<MissionItem | null>(null)
const editingTask = ref<TaskItem | null>(null)
const editingActivity = ref<ActivityItem | null>(null)
const editingSchedule = ref<ScheduleItem | null>(null)

const loadData = async () => {
    const actRes = await getActivities()
    const taskRes = await getTasks()
    const misRes = await getMissions()
    const schedRes = await getSchedules()
    const destRes = await fetchMockDestinations()

    activities.value = actRes.data ?? []
    tasks.value = taskRes.data ?? []
    missions.value = misRes.data ?? []
    schedules.value = schedRes.data ?? []
    destinations.value = destRes
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

const filteredSchedules = computed(() => {
    if (!searchQuery.value.trim()) return schedules.value
    const q = searchQuery.value.toLowerCase()
    return schedules.value.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
})

const onSearch = () => {
    // Dynamic computed search
}

// Dialog openers
const openMissionDialog = (row?: MissionItem) => {
    editingMission.value = row || null
    missionDialogVisible.value = true
}

const openTaskDialog = (row?: TaskItem) => {
    editingTask.value = row || null
    taskDialogVisible.value = true
}

const openActivityDialog = (row?: ActivityItem) => {
    editingActivity.value = row || null
    activityDialogVisible.value = true
}

const openScheduleDialog = (row?: ScheduleItem) => {
    editingSchedule.value = row || null
    scheduleDialogVisible.value = true
}

// Save Handlers
const onSaveMission = (data: {
    id?: number
    code: string
    name: string
    missionType: 'SINGLE' | 'CONVERGENCE'
    description: string
    selectedTasks: { taskId: number; robotName: string }[]
    selectedConditions: { precedingTaskId: number; triggerTaskId: number }[]
}) => {
    const compiledTasks = data.selectedTasks.map((t, idx) => {
        const found = tasks.value.find(tk => tk.id === t.taskId)
        return {
            sequence: idx + 1,
            taskId: t.taskId,
            taskName: found?.name || 'Task',
            robotName: t.robotName || '지정 로봇',
        }
    })

    const compiledConditions = data.selectedConditions.map(c => {
        const prec = tasks.value.find(tk => tk.id === c.precedingTaskId)
        const trig = tasks.value.find(tk => tk.id === c.triggerTaskId)
        return {
            precedingTaskId: c.precedingTaskId,
            precedingTaskName: prec?.name || '선행 Task',
            requiredStatus: 'COMPLETED' as const,
            triggerTaskId: c.triggerTaskId,
            triggerTaskName: trig?.name || '후속 Task',
        }
    })

    if (data.id) {
        const item = missions.value.find(m => m.id === data.id)
        if (item) {
            item.code = data.code
            item.name = data.name
            item.missionType = data.missionType
            item.description = data.description
            item.tasks = compiledTasks
            item.conditions = compiledConditions
        }
        ElMessage.success('미션 정보가 수정되었습니다.')
    } else {
        missions.value.unshift({
            id: Date.now(),
            code: data.code,
            name: data.name,
            missionType: data.missionType,
            description: data.description,
            tasks: compiledTasks,
            conditions: compiledConditions,
            status: 'ACTIVE',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 미션이 등록되었습니다.')
    }
    missionDialogVisible.value = false
}

const onSaveTask = (data: {
    id?: number
    code: string
    name: string
    robotModelName: string
    destinationId?: number
    description: string
    selectedActivities: { activityId: number }[]
}) => {
    const destName = destinations.value.find(d => d.id === data.destinationId)?.name

    const compiledActivities = data.selectedActivities.map((a, idx) => {
        const found = activities.value.find(act => act.id === a.activityId)
        return {
            sequence: idx + 1,
            activityId: a.activityId,
            activityName: found?.name || 'Activity',
            destinationName: found?.destinationName,
        }
    })

    if (data.id) {
        const item = tasks.value.find(t => t.id === data.id)
        if (item) {
            item.code = data.code
            item.name = data.name
            item.robotModelName = data.robotModelName
            item.destinationId = data.destinationId
            item.destinationName = destName
            item.activities = compiledActivities
            item.description = data.description
        }
        ElMessage.success('Task 정보가 수정되었습니다.')
    } else {
        tasks.value.unshift({
            id: Date.now(),
            code: data.code,
            name: data.name,
            robotModelId: 1,
            robotModelName: data.robotModelName,
            destinationId: data.destinationId,
            destinationName: destName,
            activities: compiledActivities,
            description: data.description,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 Task가 등록되었습니다.')
    }
    taskDialogVisible.value = false
}

const onSaveActivity = (data: {
    id?: number
    code: string
    name: string
    activityType: ActivityType
    targetRobotModelName?: string
    destinationId?: number
    description: string
}) => {
    const destName = destinations.value.find(d => d.id === data.destinationId)?.name

    if (data.id) {
        const item = activities.value.find(a => a.id === data.id)
        if (item) {
            item.code = data.code
            item.name = data.name
            item.activityType = data.activityType
            item.targetRobotModelName = data.targetRobotModelName
            item.destinationId = data.destinationId
            item.destinationName = destName
            item.description = data.description
        }
        ElMessage.success('Activity 정보가 수정되었습니다.')
    } else {
        activities.value.unshift({
            id: Date.now(),
            code: data.code,
            name: data.name,
            activityType: data.activityType,
            targetRobotModelName: data.targetRobotModelName,
            destinationId: data.destinationId,
            destinationName: destName,
            description: data.description,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 Activity가 등록되었습니다.')
    }
    activityDialogVisible.value = false
}

const onSaveSchedule = (data: {
    id?: number
    name: string
    missionId: number
    scheduleType: 'DAILY' | 'HOURLY' | 'WEEKLY'
    cronExpression: string
}) => {
    const mis = missions.value.find(m => m.id === data.missionId)

    if (data.id) {
        const item = schedules.value.find(s => s.id === data.id)
        if (item) {
            item.name = data.name
            item.missionId = data.missionId
            item.missionName = mis?.name || '미션'
            item.scheduleType = data.scheduleType
            item.cronExpression = data.cronExpression
        }
        ElMessage.success('스케줄 정보가 수정되었습니다.')
    } else {
        schedules.value.unshift({
            id: Date.now(),
            code: `SCHED-0${schedules.value.length + 1}`,
            name: data.name,
            missionId: data.missionId,
            missionName: mis?.name || '미션',
            robotId: 1,
            robotName: '통합 지정 로봇',
            cronExpression: data.cronExpression,
            scheduleType: data.scheduleType,
            nextRunAt: '2026-08-12 09:00:00',
            isActive: true,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 자동 실행 스케줄이 등록되었습니다.')
    }
    scheduleDialogVisible.value = false
}

const toggleScheduleActive = (row: ScheduleItem) => {
    ElMessage.success(`스케줄 [${row.name}] 상태가 ${row.isActive ? '활성화' : '비활성화'} 되었습니다.`)
}

// Deletion Protection Handlers
const deleteActivity = async (row: ActivityItem) => {
    const usedTask = tasks.value.find(t => t.activities.some(a => a.activityId === row.id))
    if (usedTask) {
        await ElMessageBox.alert(
            `Activity [${row.name}]는 Task [${usedTask.name}]에서 참조되어 있어 삭제할 수 없습니다.`,
            '삭제 제한 안내',
            { type: 'warning' }
        )
        return
    }
    try {
        await ElMessageBox.confirm(`[${row.name}] Activity를 삭제하시겠습니까?`, '삭제 확인', { type: 'warning' })
        activities.value = activities.value.filter(a => a.id !== row.id)
        ElMessage.success('Activity가 삭제되었습니다.')
    } catch {
        // Cancelled
    }
}

const deleteTask = async (row: TaskItem) => {
    const usedMission = missions.value.find(m => m.tasks.some(t => t.taskId === row.id))
    if (usedMission) {
        await ElMessageBox.alert(
            `Task [${row.name}]는 미션 [${usedMission.name}]에서 참조되어 있어 삭제할 수 없습니다.`,
            '삭제 제한 안내',
            { type: 'warning' }
        )
        return
    }
    try {
        await ElMessageBox.confirm(`[${row.name}] Task를 삭제하시겠습니까?`, '삭제 확인', { type: 'warning' })
        tasks.value = tasks.value.filter(t => t.id !== row.id)
        ElMessage.success('Task가 삭제되었습니다.')
    } catch {
        // Cancelled
    }
}

const deleteMission = async (row: MissionItem) => {
    const usedSched = schedules.value.find(s => s.missionId === row.id)
    if (usedSched) {
        await ElMessageBox.alert(
            `미션 [${row.name}]는 실행 스케줄 [${usedSched.name}]에 등록되어 있어 삭제할 수 없습니다.`,
            '삭제 제한 안내',
            { type: 'warning' }
        )
        return
    }
    try {
        await ElMessageBox.confirm(`[${row.name}] 미션을 삭제하시겠습니까?`, '삭제 확인', { type: 'warning' })
        missions.value = missions.value.filter(m => m.id !== row.id)
        ElMessage.success('미션이 삭제되었습니다.')
    } catch {
        // Cancelled
    }
}

const deleteSchedule = async (row: ScheduleItem) => {
    try {
        await ElMessageBox.confirm(`[${row.name}] 스케줄을 삭제하시겠습니까?`, '삭제 확인', { type: 'warning' })
        schedules.value = schedules.value.filter(s => s.id !== row.id)
        ElMessage.success('스케줄이 삭제되었습니다.')
    } catch {
        // Cancelled
    }
}
</script>

<style scoped lang="scss">
.management-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .mission-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;

        :deep(.el-tabs__header) {
            margin: 0 0 16px 0;
        }

        :deep(.el-tabs__content) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        :deep(.el-tab-pane) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;

            .el-table {
                flex: 1;
                width: 100%;
                height: 100% !important;
                min-height: 0;
            }
        }
    }
}

.task-act-tags-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
}

.task-act-tag {
    display: inline-block;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background 0.18s ease;

    &:hover {
        background: rgba(231, 109, 255, 0.2);
    }
}

.task-act-more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
}

.act-tooltip-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px 4px;
    min-width: 180px;

    .act-tooltip-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 2px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        padding-bottom: 4px;
    }

    .act-tooltip-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-color--white);

        .seq {
            font-weight: 700;
            color: var(--secondary-color);
            min-width: 18px;
        }

        .name {
            white-space: nowrap;
        }
    }
}
</style>
