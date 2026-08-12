<template>
    <div class="mission-management-page">
        <Panel title="미션 및 스케줄 관리" subtitle="Activity, Task, Mission 및 자동 수행 스케줄 관리" fill>
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

        <!-- 1. Mission Form Dialog -->
        <BaseDialog
            v-model="missionDialogVisible"
            :title="editingMissionId ? 'Mission 수정' : '신규 Mission 등록'"
            width="680px"
        >
            <el-form label-position="top">
                <el-form-item label="미션 코드" required>
                    <el-input v-model="missionForm.code" placeholder="예: MIS-FUSED-01" />
                </el-form-item>
                <el-form-item label="미션 이름" required>
                    <el-input v-model="missionForm.name" placeholder="예: [융합] 폐기물 이송 및 장입 미션" />
                </el-form-item>
                <el-form-item label="미션 유형" required>
                    <el-radio-group v-model="missionForm.missionType" class="mission-type-radio-group">
                        <el-radio-button value="CONVERGENCE">융합 미션</el-radio-button>
                        <el-radio-button value="SINGLE">단일 미션</el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <!-- 포함 Task 순서 구성 -->
                <el-form-item label="포함 Task 및 로봇 배정 조합">
                    <div v-for="(tItem, tIdx) in missionForm.selectedTasks" :key="tIdx" class="builder-row">
                        <span class="seq-num">{{ tIdx + 1 }}.</span>
                        <el-select v-model="tItem.taskId" style="flex:1" placeholder="Task 선택">
                            <el-option
                                v-for="tk in tasks"
                                :key="tk.id"
                                :label="`[${tk.code}] ${tk.name}`"
                                :value="tk.id"
                            />
                        </el-select>
                        <el-input v-model="tItem.robotName" placeholder="배정 로봇명 (예: 무인지게차 1호기)" style="flex:1" />
                        <button type="button" class="builder-delete-btn" circle title="삭제" @click="removeMissionTask(tIdx)">
                            <el-icon><Trash2 /></el-icon>
                        </button>
                    </div>
                    <el-button type="primary" plain size="small" style="margin-top: 8px" @click="addMissionTask">+ Task 추가</el-button>
                </el-form-item>

                <!-- 선행 조건 설정 (미션 시나리오) -->
                <el-form-item label="Task 간 선행 조건 (미션 트리거 시나리오)">
                    <div v-for="(cItem, cIdx) in missionForm.selectedConditions" :key="cIdx" class="builder-row">
                        <el-select v-model="cItem.precedingTaskId" placeholder="선행 Task" style="flex:1">
                            <el-option v-for="tk in tasks" :key="tk.id" :label="tk.name" :value="tk.id" />
                        </el-select>
                        <span class="cond-txt">완료 시 ➔</span>
                        <el-select v-model="cItem.triggerTaskId" placeholder="후속 Task 실행" style="flex:1">
                            <el-option v-for="tk in tasks" :key="tk.id" :label="tk.name" :value="tk.id" />
                        </el-select>
                        <button type="button" class="builder-delete-btn" title="삭제" @click="removeMissionCondition(cIdx)">
                            <el-icon><Trash2 /></el-icon>
                        </button>
                    </div>
                    <el-button type="primary" plain size="small" style="margin-top: 8px" @click="addMissionCondition">+ 선행 조건 추가</el-button>
                </el-form-item>

                <el-form-item label="미션 설명">
                    <el-input v-model="missionForm.description" type="textarea" :rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="missionDialogVisible = false">취소</el-button>
                <el-button type="primary" @click="saveMission">저장</el-button>
            </template>
        </BaseDialog>

        <!-- 2. Task Form Dialog -->
        <BaseDialog
            v-model="taskDialogVisible"
            :title="editingTaskId ? 'Task 정보 수정' : '신규 Task 등록'"
            width="650px"
        >
            <el-form label-position="top">
                <el-form-item label="Task 코드" required>
                    <el-input v-model="taskForm.code" placeholder="예: TASK-FORKLIFT-01" />
                </el-form-item>
                <el-form-item label="Task 이름" required>
                    <el-input v-model="taskForm.name" placeholder="예: 무인지게차 팰릿 적재 및 수송 Task" />
                </el-form-item>
                <el-form-item label="대상 로봇 모델" required>
                    <el-select v-model="taskForm.robotModelName" style="width:100%">
                        <el-option label="무인지게차 (AGV Forklift)" value="무인지게차" />
                        <el-option label="저상형 AMR" value="저상형 AMR" />
                        <el-option label="산업용 로봇" value="산업용 로봇" />
                        <el-option label="4족 보행 로봇 (Spot)" value="4족 보행 로봇" />
                    </el-select>
                </el-form-item>
                <el-form-item label="목적지 (POI) 연동">
                    <el-select v-model="taskForm.destinationId" style="width:100%" clearable placeholder="목적지 선택">
                        <el-option
                            v-for="dest in destinations"
                            :key="dest.id"
                            :label="`[${dest.type}] ${dest.name}`"
                            :value="dest.id"
                        />
                    </el-select>
                </el-form-item>

                <!-- Activity 동적 순서 조합 -->
                <el-form-item label="포함 Activity 순서 조합">
                    <div v-for="(actItem, aIdx) in taskForm.selectedActivities" :key="aIdx" class="builder-row">
                        <span class="seq-num">{{ aIdx + 1 }}.</span>
                        <el-select v-model="actItem.activityId" style="flex:1" placeholder="Activity 선택">
                            <el-option
                                v-for="act in activities"
                                :key="act.id"
                                :label="`[${act.code}] ${act.name}`"
                                :value="act.id"
                            />
                        </el-select>
                        <button type="button" class="builder-delete-btn" title="삭제" @click="removeTaskActivity(aIdx)">
                            <el-icon><Trash2 /></el-icon>
                        </button>
                    </div>
                    <el-button type="primary" plain size="small" style="margin-top: 8px" @click="addTaskActivity">+ Activity 추가</el-button>
                </el-form-item>

                <el-form-item label="Task 설명">
                    <el-input v-model="taskForm.description" type="textarea" :rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="taskDialogVisible = false">취소</el-button>
                <el-button type="primary" @click="saveTask">저장</el-button>
            </template>
        </BaseDialog>

        <!-- 3. Activity Form Dialog -->
        <BaseDialog
            v-model="activityDialogVisible"
            :title="editingActivityId ? 'Activity 정보 수정' : '신규 Activity 등록'"
            width="600px"
        >
            <el-form label-position="top">
                <el-form-item label="Activity 코드" required>
                    <el-input v-model="activityForm.code" placeholder="예: ACT-MOVE-01" />
                </el-form-item>
                <el-form-item label="Activity 이름" required>
                    <el-input v-model="activityForm.name" placeholder="예: 처분용기 전면 주행" />
                </el-form-item>
                <el-form-item label="동작 유형 (Type)" required>
                    <el-select v-model="activityForm.activityType" style="width:100%">
                        <el-option label="이동 (MOVE)" value="MOVE" />
                        <el-option label="상차/집게 (PICK)" value="PICK" />
                        <el-option label="하차/장입 (PLACE)" value="PLACE" />
                        <el-option label="검사/순찰 (INSPECT)" value="INSPECT" />
                        <el-option label="대기 (WAIT)" value="WAIT" />
                        <el-option label="충전 (CHARGE)" value="CHARGE" />
                    </el-select>
                </el-form-item>
                <el-form-item label="대상 로봇 모델">
                    <el-select v-model="activityForm.targetRobotModelName" style="width:100%" clearable placeholder="전역/전체 로봇 적용">
                        <el-option label="무인지게차 (AGV Forklift)" value="무인지게차" />
                        <el-option label="저상형 AMR" value="저상형 AMR" />
                        <el-option label="산업용 로봇" value="산업용 로봇" />
                        <el-option label="4족 보행 로봇 (Spot)" value="4족 보행 로봇" />
                    </el-select>
                </el-form-item>
                <el-form-item label="목적지 (POI) 연동">
                    <el-select v-model="activityForm.destinationId" style="width:100%" clearable placeholder="목적지 선택">
                        <el-option
                            v-for="dest in destinations"
                            :key="dest.id"
                            :label="`[${dest.type}] ${dest.name}`"
                            :value="dest.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="설명">
                    <el-input v-model="activityForm.description" type="textarea" :rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="activityDialogVisible = false">취소</el-button>
                <el-button type="primary" @click="saveActivity">저장</el-button>
            </template>
        </BaseDialog>

        <!-- 4. Schedule Form Dialog -->
        <BaseDialog
            v-model="scheduleDialogVisible"
            :title="editingScheduleId ? '자동 실행 스케줄 수정' : '신규 자동 실행 스케줄 등록'"
            width="620px"
        >
            <el-form label-position="top">
                <el-form-item label="스케줄 명칭" required>
                    <el-input v-model="scheduleForm.name" placeholder="예: 정기 오전 방사성 폐기물 자동 수송" />
                </el-form-item>
                <el-form-item label="실행 대상 미션" required>
                    <el-select v-model="scheduleForm.missionId" style="width:100%">
                        <el-option
                            v-for="mis in missions"
                            :key="mis.id"
                            :label="`[${mis.code}] ${mis.name}`"
                            :value="mis.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="주기 유형" required>
                    <el-select v-model="scheduleForm.scheduleType" style="width:100%">
                        <el-option label="매일 정시 실행 (DAILY)" value="DAILY" />
                        <el-option label="시간 간격 실행 (HOURLY)" value="HOURLY" />
                        <el-option label="주간 지정 실행 (WEEKLY)" value="WEEKLY" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Cron / 실행 시간 표현식" required>
                    <el-input v-model="scheduleForm.cronExpression" placeholder="예: 매일 09:00 또는 0 0 9 * * ?" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="scheduleDialogVisible = false">취소</el-button>
                <el-button type="primary" @click="saveSchedule">저장</el-button>
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
import { Trash2 } from '@lucide/vue'
import { getActivities, getTasks, getMissions, getSchedules } from './service/missionManagement.api'
import type { ActivityItem, TaskItem, MissionItem, ScheduleItem, ActivityType } from './service/missionManagement.types'
import { fetchMockDestinations } from '../destinations/service/destinations.mock'
import type { DestinationItem } from '../destinations/service/destinations.types'

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

const editingMissionId = ref<number | null>(null)
const editingTaskId = ref<number | null>(null)
const editingActivityId = ref<number | null>(null)
const editingScheduleId = ref<number | null>(null)

const missionForm = ref({
    code: '',
    name: '',
    missionType: 'CONVERGENCE' as 'SINGLE' | 'CONVERGENCE',
    description: '',
    selectedTasks: [] as { taskId: number; robotName: string }[],
    selectedConditions: [] as { precedingTaskId: number; triggerTaskId: number }[],
})

const taskForm = ref({
    code: '',
    name: '',
    robotModelName: '무인지게차',
    destinationId: undefined as number | undefined,
    selectedActivities: [] as { activityId: number }[],
    description: '',
})

const activityForm = ref({
    code: '',
    name: '',
    activityType: 'MOVE' as ActivityType,
    targetRobotModelName: undefined as string | undefined,
    destinationId: undefined as number | undefined,
    description: '',
})

const scheduleForm = ref({
    name: '',
    missionId: 1,
    scheduleType: 'DAILY' as 'DAILY' | 'HOURLY' | 'WEEKLY',
    cronExpression: '매일 09:00',
})

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

// Dialog openers with edit support
const openMissionDialog = (row?: MissionItem) => {
    if (row) {
        editingMissionId.value = row.id
        missionForm.value = {
            code: row.code,
            name: row.name,
            missionType: row.missionType,
            description: row.description || '',
            selectedTasks: row.tasks.map(t => ({ taskId: t.taskId, robotName: t.robotName })),
            selectedConditions: row.conditions.map(c => ({ precedingTaskId: c.precedingTaskId, triggerTaskId: c.triggerTaskId })),
        }
    } else {
        editingMissionId.value = null
        missionForm.value = {
            code: `MIS-CONV-0${missions.value.length + 1}`,
            name: '',
            missionType: 'CONVERGENCE',
            description: '',
            selectedTasks: tasks.value.slice(0, 2).map(t => ({ taskId: t.id, robotName: '통합 지정 로봇' })),
            selectedConditions: [],
        }
    }
    missionDialogVisible.value = true
}

const addMissionTask = () => {
    missionForm.value.selectedTasks.push({
        taskId: tasks.value[0]?.id ?? 1,
        robotName: '지정 로봇 1호기',
    })
}
const removeMissionTask = (idx: number) => {
    missionForm.value.selectedTasks.splice(idx, 1)
}

const addMissionCondition = () => {
    missionForm.value.selectedConditions.push({
        precedingTaskId: tasks.value[0]?.id ?? 1,
        triggerTaskId: tasks.value[1]?.id ?? 2,
    })
}
const removeMissionCondition = (idx: number) => {
    missionForm.value.selectedConditions.splice(idx, 1)
}

const openTaskDialog = (row?: TaskItem) => {
    if (row) {
        editingTaskId.value = row.id
        taskForm.value = {
            code: row.code,
            name: row.name,
            robotModelName: row.robotModelName,
            destinationId: row.destinationId,
            selectedActivities: row.activities.map(a => ({ activityId: a.activityId })),
            description: row.description || '',
        }
    } else {
        editingTaskId.value = null
        taskForm.value = {
            code: `TASK-AUTO-0${tasks.value.length + 1}`,
            name: '',
            robotModelName: '무인지게차',
            destinationId: undefined,
            selectedActivities: activities.value.slice(0, 1).map(a => ({ activityId: a.id })),
            description: '',
        }
    }
    taskDialogVisible.value = true
}

const addTaskActivity = () => {
    taskForm.value.selectedActivities.push({
        activityId: activities.value[0]?.id ?? 1,
    })
}
const removeTaskActivity = (idx: number) => {
    taskForm.value.selectedActivities.splice(idx, 1)
}

const openActivityDialog = (row?: ActivityItem) => {
    if (row) {
        editingActivityId.value = row.id
        activityForm.value = {
            code: row.code,
            name: row.name,
            activityType: row.activityType,
            targetRobotModelName: row.targetRobotModelName,
            destinationId: row.destinationId,
            description: row.description || '',
        }
    } else {
        editingActivityId.value = null
        activityForm.value = {
            code: `ACT-AUTO-0${activities.value.length + 1}`,
            name: '',
            activityType: 'MOVE',
            targetRobotModelName: undefined,
            destinationId: undefined,
            description: '',
        }
    }
    activityDialogVisible.value = true
}

const openScheduleDialog = (row?: ScheduleItem) => {
    if (row) {
        editingScheduleId.value = row.id
        scheduleForm.value = {
            name: row.name,
            missionId: row.missionId,
            scheduleType: row.scheduleType === 'CUSTOM' ? 'DAILY' : row.scheduleType,
            cronExpression: row.cronExpression,
        }
    } else {
        editingScheduleId.value = null
        scheduleForm.value = {
            name: '',
            missionId: missions.value[0]?.id ?? 1,
            scheduleType: 'DAILY',
            cronExpression: '매일 09:00',
        }
    }
    scheduleDialogVisible.value = true
}

// Savers
const saveMission = () => {
    if (!missionForm.value.name.trim() || !missionForm.value.code.trim()) {
        ElMessage.warning('미션 코드와 이름을 입력하세요.')
        return
    }

    const compiledTasks = missionForm.value.selectedTasks.map((t, idx) => {
        const found = tasks.value.find(tk => tk.id === t.taskId)
        return {
            sequence: idx + 1,
            taskId: t.taskId,
            taskName: found?.name || 'Task',
            robotName: t.robotName || '지정 로봇',
        }
    })

    const compiledConditions = missionForm.value.selectedConditions.map(c => {
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

    if (editingMissionId.value) {
        const item = missions.value.find(m => m.id === editingMissionId.value)
        if (item) {
            item.code = missionForm.value.code
            item.name = missionForm.value.name
            item.missionType = missionForm.value.missionType
            item.description = missionForm.value.description
            item.tasks = compiledTasks
            item.conditions = compiledConditions
        }
        ElMessage.success('미션 정보가 수정되었습니다.')
    } else {
        missions.value.unshift({
            id: Date.now(),
            code: missionForm.value.code,
            name: missionForm.value.name,
            missionType: missionForm.value.missionType,
            description: missionForm.value.description,
            tasks: compiledTasks,
            conditions: compiledConditions,
            status: 'ACTIVE',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 미션이 등록되었습니다.')
    }
    missionDialogVisible.value = false
}

const saveTask = () => {
    if (!taskForm.value.name.trim() || !taskForm.value.code.trim()) {
        ElMessage.warning('Task 코드와 이름을 입력하세요.')
        return
    }
    const destName = destinations.value.find(d => d.id === taskForm.value.destinationId)?.name

    const compiledActivities = taskForm.value.selectedActivities.map((a, idx) => {
        const found = activities.value.find(act => act.id === a.activityId)
        return {
            sequence: idx + 1,
            activityId: a.activityId,
            activityName: found?.name || 'Activity',
            destinationName: found?.destinationName,
        }
    })

    if (editingTaskId.value) {
        const item = tasks.value.find(t => t.id === editingTaskId.value)
        if (item) {
            item.code = taskForm.value.code
            item.name = taskForm.value.name
            item.robotModelName = taskForm.value.robotModelName
            item.destinationId = taskForm.value.destinationId
            item.destinationName = destName
            item.activities = compiledActivities
            item.description = taskForm.value.description
        }
        ElMessage.success('Task 정보가 수정되었습니다.')
    } else {
        tasks.value.unshift({
            id: Date.now(),
            code: taskForm.value.code,
            name: taskForm.value.name,
            robotModelId: 1,
            robotModelName: taskForm.value.robotModelName,
            destinationId: taskForm.value.destinationId,
            destinationName: destName,
            activities: compiledActivities,
            description: taskForm.value.description,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 Task가 등록되었습니다.')
    }
    taskDialogVisible.value = false
}

const saveActivity = () => {
    if (!activityForm.value.name.trim() || !activityForm.value.code.trim()) {
        ElMessage.warning('Activity 코드와 이름을 입력하세요.')
        return
    }
    const destName = destinations.value.find(d => d.id === activityForm.value.destinationId)?.name

    if (editingActivityId.value) {
        const item = activities.value.find(a => a.id === editingActivityId.value)
        if (item) {
            item.code = activityForm.value.code
            item.name = activityForm.value.name
            item.activityType = activityForm.value.activityType
            item.targetRobotModelName = activityForm.value.targetRobotModelName
            item.destinationId = activityForm.value.destinationId
            item.destinationName = destName
            item.description = activityForm.value.description
        }
        ElMessage.success('Activity 정보가 수정되었습니다.')
    } else {
        activities.value.unshift({
            id: Date.now(),
            code: activityForm.value.code,
            name: activityForm.value.name,
            activityType: activityForm.value.activityType,
            targetRobotModelName: activityForm.value.targetRobotModelName,
            destinationId: activityForm.value.destinationId,
            destinationName: destName,
            description: activityForm.value.description,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })
        ElMessage.success('신규 Activity가 등록되었습니다.')
    }
    activityDialogVisible.value = false
}

const saveSchedule = () => {
    if (!scheduleForm.value.name.trim()) {
        ElMessage.warning('스케줄 명칭을 입력하세요.')
        return
    }
    const mis = missions.value.find(m => m.id === scheduleForm.value.missionId)

    if (editingScheduleId.value) {
        const item = schedules.value.find(s => s.id === editingScheduleId.value)
        if (item) {
            item.name = scheduleForm.value.name
            item.missionId = scheduleForm.value.missionId
            item.missionName = mis?.name || '미션'
            item.scheduleType = scheduleForm.value.scheduleType
            item.cronExpression = scheduleForm.value.cronExpression
        }
        ElMessage.success('스케줄 정보가 수정되었습니다.')
    } else {
        schedules.value.unshift({
            id: Date.now(),
            code: `SCHED-0${schedules.value.length + 1}`,
            name: scheduleForm.value.name,
            missionId: scheduleForm.value.missionId,
            missionName: mis?.name || '미션',
            robotId: 1,
            robotName: '통합 지정 로봇',
            cronExpression: scheduleForm.value.cronExpression,
            scheduleType: scheduleForm.value.scheduleType,
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
            `Task [${row.name}]는 Mission [${usedMission.name}]에서 참조되어 있어 삭제할 수 없습니다.`,
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
    const usedSchedule = schedules.value.find(s => s.missionId === row.id)
    if (usedSchedule) {
        await ElMessageBox.alert(
            `Mission [${row.name}]는 자동 스케줄 [${usedSchedule.name}]에서 참조되어 있어 삭제할 수 없습니다.`,
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
.mission-management-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    min-height: 0;
}

.mission-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

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
            min-height: 0;
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

.builder-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    width: 100%;

    .seq-num {
        font-weight: 700;
        color: var(--primary-color);
        width: 20px;
    }

    .cond-txt {
        font-size: 12px;
        color: var(--secondary-color);
        white-space: nowrap;
    }
}

.mission-type-radio-group {
    display: flex;
    width: 100%;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 3px;

    :deep(.el-radio-button) {
        flex: 1;
        display: flex;

        .el-radio-button__inner {
            width: 100%;
            background: transparent;
            border: 1px solid transparent !important;
            border-radius: 6px;
            color: var(--text-color--secondary);
            box-shadow: none !important;
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
            padding: 8px 16px;
            font-weight: 500;
        }

        &.is-active .el-radio-button__inner {
            background: var(--primary-color-1);
            color: var(--primary-color);
            border-color: var(--border-glass-color) !important;
            font-weight: 700;
        }
    }
}

.builder-delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    color: #ff7878;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;

    &:hover {
        background: rgba(255, 107, 107, 0.18);
        color: #ff4d4d;
    }
}
</style>
