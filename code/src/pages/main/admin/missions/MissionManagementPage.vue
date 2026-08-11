<template>
    <div class="mission-management-page">
        <Panel title="미션 및 스케줄 관리" subtitle="Activity, Task, 융합 Mission 및 자동 수행 스케줄 관리">
            <el-tabs v-model="activeTab" class="mission-tabs">
                <!-- 1. 융합 Mission 관리 탭 -->
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
                        <el-table-column prop="createdAt" label="등록일시" width="180" />
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

                <!-- 2. Task 관리 탭 -->
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
                                <span v-for="act in row.activities" :key="act.sequence" class="task-act-tag">
                                    {{ act.sequence }}. {{ act.activityName }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                    </el-table>
                </el-tab-pane>

                <!-- 3. Activity 관리 탭 -->
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
                        <el-table-column prop="name" label="Activity 이름" min-width="180" />
                        <el-table-column prop="activityType" label="유형" width="120" />
                        <el-table-column label="대상 목적지 (POI)" min-width="200">
                            <template #default="{ row }">
                                <StatusBadge :label="row.destinationName || '전역/미지정'" variant="success" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="설명" min-width="200" />
                        <el-table-column prop="createdAt" label="등록일시" width="170" />
                    </el-table>
                </el-tab-pane>

                <!-- 4. 스케줄 관리 탭 -->
                <el-tab-pane label="자동 실행 스케줄 관리" name="schedules">
                    <TableToolbar>
                        <template #left>
                            <SearchText v-model="searchQuery" placeholder="스케줄 검색" @search="onSearch" />
                        </template>
                        <template #right>
                            <el-button type="primary" @click="openScheduleDialog">신규 스케줄 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="filteredSchedules" stripe style="width: 100%">
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
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </Panel>

        <!-- 1. Mission Form Dialog -->
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

        <!-- 2. Task Form Dialog -->
        <BaseDialog
            v-model="taskDialogVisible"
            title="신규 Task 등록"
            width="600px"
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
            title="신규 Activity 등록"
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
            title="신규 자동 실행 스케줄 등록"
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

const missionForm = ref({
    code: '',
    name: '',
    missionType: 'CONVERGENCE' as 'SINGLE' | 'CONVERGENCE',
    description: '',
})

const taskForm = ref({
    code: '',
    name: '',
    robotModelName: '무인지게차',
    destinationId: undefined as number | undefined,
    description: '',
})

const activityForm = ref({
    code: '',
    name: '',
    activityType: 'MOVE' as ActivityType,
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
    taskForm.value = {
        code: `TASK-AUTO-0${tasks.value.length + 1}`,
        name: '',
        robotModelName: '무인지게차',
        destinationId: undefined,
        description: '',
    }
    taskDialogVisible.value = true
}

const openActivityDialog = () => {
    activityForm.value = {
        code: `ACT-AUTO-0${activities.value.length + 1}`,
        name: '',
        activityType: 'MOVE',
        destinationId: undefined,
        description: '',
    }
    activityDialogVisible.value = true
}

const openScheduleDialog = () => {
    scheduleForm.value = {
        name: '',
        missionId: missions.value[0]?.id ?? 1,
        scheduleType: 'DAILY',
        cronExpression: '매일 09:00',
    }
    scheduleDialogVisible.value = true
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

const saveTask = () => {
    if (!taskForm.value.name.trim() || !taskForm.value.code.trim()) {
        ElMessage.warning('Task 코드와 이름을 입력하세요.')
        return
    }
    const destName = destinations.value.find(d => d.id === taskForm.value.destinationId)?.name
    tasks.value.unshift({
        id: Date.now(),
        code: taskForm.value.code,
        name: taskForm.value.name,
        robotModelId: 1,
        robotModelName: taskForm.value.robotModelName,
        destinationId: taskForm.value.destinationId,
        destinationName: destName,
        activities: [],
        description: taskForm.value.description,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    })
    taskDialogVisible.value = false
    ElMessage.success('신규 Task가 등록되었습니다.')
}

const saveActivity = () => {
    if (!activityForm.value.name.trim() || !activityForm.value.code.trim()) {
        ElMessage.warning('Activity 코드와 이름을 입력하세요.')
        return
    }
    const destName = destinations.value.find(d => d.id === activityForm.value.destinationId)?.name
    activities.value.unshift({
        id: Date.now(),
        code: activityForm.value.code,
        name: activityForm.value.name,
        activityType: activityForm.value.activityType,
        destinationId: activityForm.value.destinationId,
        destinationName: destName,
        description: activityForm.value.description,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    })
    activityDialogVisible.value = false
    ElMessage.success('신규 Activity가 등록되었습니다.')
}

const saveSchedule = () => {
    if (!scheduleForm.value.name.trim()) {
        ElMessage.warning('스케줄 명칭을 입력하세요.')
        return
    }
    const mis = missions.value.find(m => m.id === scheduleForm.value.missionId)
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
    scheduleDialogVisible.value = false
    ElMessage.success('신규 자동 실행 스케줄이 등록되었습니다.')
}

const toggleScheduleActive = (row: ScheduleItem) => {
    ElMessage.success(`스케줄 [${row.name}] 상태가 ${row.isActive ? '활성화' : '비활성화'} 되었습니다.`)
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
