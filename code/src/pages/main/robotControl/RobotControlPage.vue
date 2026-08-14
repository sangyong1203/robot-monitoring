<template>
    <div class="robot-control-page">
        <!-- 상단 영역: 소속 기관 운영 중인 로봇 목록 (한 줄 레이아웃 + 좌우 가로 스크롤) -->
        <div class="robots-overview-section">
            <div class="section-title">
                <div class="title-left">
                    <span class="title-text">소속 기관 운영 로봇 목록</span>
                    <span class="title-sub">(클릭하여 제어 대상 선택)</span>
                </div>
                <span class="active-count">가동 중 로봇: <strong>{{ operatingRobotCount }}대</strong> / 전체 7대</span>
            </div>
            <div class="robots-card-scroll-wrap">
                <div class="robots-card-grid">
                    <div
                        v-for="robot in robots"
                        :key="robot.id"
                        class="robot-overview-card"
                        :class="{ 'is-selected': selectedRobotId === robot.id }"
                        @click="selectRobot(robot.id)"
                    >
                        <div class="card-header">
                            <span class="robot-type-tag" :class="robot.robotType.toLowerCase()">
                                {{ robot.robotType === 'WORK' ? '작업용' : '감시용' }}
                            </span>
                            <StatusBadge :label="stateLabel(robot.operatingState)" :variant="stateVariant(robot.operatingState)" />
                        </div>
                        <div class="card-name">{{ robot.name }}</div>
                        <div class="card-details">
                            <div class="detail-row">
                                <span class="lbl">구역:</span>
                                <span class="val text-zone">{{ robot.zoneName }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="lbl">배터리:</span>
                                <span class="val text-battery">{{ robot.batteryPercent }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 하단 탭: 로봇 수동 제어 / 자동 제어 스케줄 관리 -->
        <el-tabs v-model="activeTab" class="control-main-tabs">
            <!-- 1. 수동 제어 탭 -->
            <el-tab-pane label="로봇 수동 제어" name="manual" style="height: 100%;">
                <RobotManualControlPanel :robot="selectedRobot" @command-sent="loadControlLogs" />
            </el-tab-pane>

            <!-- 2. 제어 명령 집행 이력 탭 -->
            <el-tab-pane label="제어 명령 집행 이력" name="logs">
                <el-table :data="logs" stripe height="100%">
                    <el-table-column prop="requestedAt" label="요청시각" width="160" />
                    <el-table-column label="대상 로봇" width="160">
                        <template #default="{ row }">
                            <TableRowTooltip :content="row.robotName" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="commandType" label="명령 유형" width="140" />
                    <el-table-column label="세부 내용" min-width="260">
                        <template #default="{ row }">
                            <TableRowTooltip :content="row.payloadSummary" />
                        </template>
                    </el-table-column>
                    <el-table-column label="요청자" width="140">
                        <template #default="{ row }">
                            <TableRowTooltip :content="row.requestedBy" />
                        </template>
                    </el-table-column>
                    <el-table-column label="상태" width="120" align="center">
                        <template #default="{ row }">
                            <StatusBadge :label="row.status" :variant="row.status === 'APPLIED' ? 'success' : 'info'" />
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>

            <!-- 3. 자동 제어 스케줄 탭 -->
            <el-tab-pane label="자동 제어 스케줄 관리" name="schedules">
                <TableToolbar>
                    <template #right>
                        <el-button type="primary" @click="openScheduleDialog">신규 자동 제어 등록</el-button>
                    </template>
                </TableToolbar>

                <el-table :data="schedules" stripe style="width: 100%">
                    <el-table-column label="스케줄 명칭" min-width="200">
                        <template #default="{ row }">
                            <TableRowTooltip :content="row.name" />
                        </template>
                    </el-table-column>
                    <el-table-column label="실행 대상 (Task/Mission)" min-width="220">
                        <template #default="{ row }">
                            <TableRowTooltip
                                :content="row.targetType === 'TASK' ? `[Task] ${row.taskName}` : `[Mission] ${row.missionName}`"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="배정 로봇" width="170">
                        <template #default="{ row }">
                            <TableRowTooltip :content="row.robotName" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="cronExpression" label="실행 주기" width="140" align="center" />
                    <el-table-column prop="repeatCondition" label="반복 조건" width="160" align="center" />
                    <el-table-column label="연계 이벤트 코드" min-width="180">
                        <template #default="{ row }">
                            <StatusBadge :label="row.eventCodeName || '일반 정기 실행'" variant="info" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="nextRunAt" label="다음 실행 예정" width="170" align="center" />
                    <el-table-column label="활성 상태" width="100" align="center">
                        <template #default="{ row }">
                            <el-switch v-model="row.status" active-value="ACTIVE" inactive-value="PAUSED" @change="toggleSchedule(row)" />
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>

        <!-- 2. 신규 자동 제어 등록 다이얼로그 -->
        <BaseDialog
            v-model="scheduleDialogVisible"
            title="신규 자동 제어 스케줄 등록"
            description="Task 또는 Mission에 주기 조건, 반복 조건, 운영·이벤트 코드를 연결하여 스케줄을 생성합니다."
            width="680px"
        >
            <el-form label-position="top" class="management-page__form-grid">
                <el-form-item label="스케줄 명칭" required style="grid-column: span 2">
                    <el-input v-model="scheduleForm.name" placeholder="예: 매일 오전 방사성 폐기물 자동 수송 스케줄" />
                </el-form-item>

                <el-form-item label="제어 실행 단위" required>
                    <RadioToggleGroup
                        v-model="scheduleForm.targetType"
                        :options="[
                            { label: 'Mission 단위', value: 'MISSION' },
                            { label: 'Task 단위', value: 'TASK' },
                        ]"
                    />
                </el-form-item>

                <el-form-item label="대상 선택" required>
                    <el-select v-if="scheduleForm.targetType === 'MISSION'" v-model="scheduleForm.targetId" style="width:100%">
                        <el-option v-for="m in missions" :key="m.id" :label="m.name" :value="m.id" />
                    </el-select>
                    <el-select v-else v-model="scheduleForm.targetId" style="width:100%">
                        <el-option v-for="t in tasks" :key="t.id" :label="t.name" :value="t.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="배정 대상 로봇" required>
                    <el-select v-model="scheduleForm.robotId" style="width:100%">
                        <el-option v-for="r in operatingRobots" :key="r.id" :label="`${r.name} (${r.operatingState})`" :value="r.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="주기 유형 (실행 주기)" required>
                    <el-select v-model="scheduleForm.cycleType" style="width:100%">
                        <el-option label="매일 정시 실행 (DAILY)" value="DAILY" />
                        <el-option label="시간 간격 실행 (HOURLY)" value="HOURLY" />
                        <el-option label="주간 지정 실행 (WEEKLY)" value="WEEKLY" />
                        <el-option label="사용자 지정 Cron 표현식 (CUSTOM)" value="CUSTOM" />
                    </el-select>
                </el-form-item>

                <!-- 1. DAILY 옵션 -->
                <el-form-item v-if="scheduleForm.cycleType === 'DAILY'" label="매일 실행 시간 설정" required style="grid-column: span 2">
                    <el-time-picker
                        v-model="scheduleDailyTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="매일 실행 시간 선택"
                        style="width: 100%"
                    />
                </el-form-item>

                <!-- 2. HOURLY 옵션 -->
                <el-form-item v-if="scheduleForm.cycleType === 'HOURLY'" label="실행 시간 간격 설정" required style="grid-column: span 2">
                    <div class="hourly-picker-row">
                        <el-input-number v-model="scheduleHourlyInterval" :min="1" :max="24" style="width: 160px" />
                        <span class="unit-txt">시간 간격마다 자동 실행</span>
                    </div>
                </el-form-item>

                <!-- 3. WEEKLY 옵션 -->
                <el-form-item v-if="scheduleForm.cycleType === 'WEEKLY'" label="주간 실행 요일 및 시간 설정" required style="grid-column: span 2">
                    <div class="weekly-picker-box">
                        <DaysCheckboxGroup v-model="scheduleWeeklyDays" />
                        <el-time-picker
                            v-model="scheduleWeeklyTime"
                            format="HH:mm"
                            value-format="HH:mm"
                            placeholder="실행 시간 선택"
                            style="width: 100%; margin-top: 8px"
                        />
                    </div>
                </el-form-item>

                <!-- 4. CUSTOM 옵션 -->
                <el-form-item v-if="scheduleForm.cycleType === 'CUSTOM'" label="Cron 표현식 직접 입력" required style="grid-column: span 2">
                    <el-input v-model="scheduleCustomCron" placeholder="예: 0 0 9 * * ?" />
                    <div class="preset-badges">
                        <span class="preset-label">자주 쓰는 프리셋:</span>
                        <button type="button" class="preset-btn" @click="scheduleCustomCron = '매일 09:00'">매일 09:00</button>
                        <button type="button" class="preset-btn" @click="scheduleCustomCron = '2시간 간격'">2시간 간격</button>
                        <button type="button" class="preset-btn" @click="scheduleCustomCron = '매주 월,수 09:00'">매주 월,수 09:00</button>
                    </div>
                </el-form-item>

                <!-- 요약 프리뷰 -->
                <div class="schedule-summary-box" style="grid-column: span 2">
                    <span class="summary-icon">⏱️</span>
                    <span class="summary-label">실행 표현식 요약:</span>
                    <span class="summary-value">{{ computedScheduleCronExpression }}</span>
                </div>

                <el-form-item label="반복 조건" required>
                    <el-select v-model="scheduleForm.repeatType" style="width:100%">
                        <el-option label="영구 반복 (PERMANENT)" value="PERMANENT" />
                        <el-option label="지정 횟수 반복 (COUNT)" value="COUNT" />
                    </el-select>
                </el-form-item>

                <el-form-item v-if="scheduleForm.repeatType === 'COUNT'" label="반복 횟수">
                    <el-input-number v-model="scheduleForm.repeatCount" :min="1" :max="100" style="width:100%" />
                </el-form-item>
                <div v-else></div>

                <el-form-item label="연동 운영·이벤트 코드 선택" style="grid-column: span 2">
                    <el-select v-model="scheduleForm.eventCodeId" style="width:100%" clearable placeholder="이벤트 코드 선택 (선택 사항)">
                        <el-option label="EVT-PATROL-01 (외곽 감시 구역 침입 감시 코드)" :value="1" />
                        <el-option label="EVT-TRANSPORT-01 (팰릿 도킹 완료 신호 코드)" :value="2" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="scheduleDialogVisible = false">취소</el-button>
                <el-button type="primary" @click="saveSchedule">스케줄 등록</el-button>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TableToolbar from '@/components/TableToolbar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import DaysCheckboxGroup from '@/components/DaysCheckboxGroup.vue'
import RadioToggleGroup from '@/components/RadioToggleGroup.vue'
import TableRowTooltip from '@/components/TableRowTooltip.vue'
import RobotManualControlPanel from '@/features/robotManualControl/components/RobotManualControlPanel.vue'
import { ElMessage } from 'element-plus'
import { getControlLogs, getControlSchedules } from './service/robotControl.api'
import type { AutoControlSchedule, RobotControlLog } from './service/robotControl.types'
import { getTasks, getMissions } from '../admin/missions/service/missionManagement.api'
import type { TaskItem, MissionItem } from '../admin/missions/service/missionManagement.types'

type OperatingState = 'IDLE' | 'RUNNING' | 'MANUAL_CONTROL' | 'SCHEDULE_RUNNING' | 'CHARGING' | 'POWER_OFF'

type RobotOverviewItem = {
    id: number
    name: string
    robotType: 'WORK' | 'SURVEILLANCE'
    zoneName: string
    x: number
    y: number
    batteryPercent: number
    operatingState: OperatingState
    communicationStatus: 'ONLINE' | 'OFFLINE'
}

const activeTab = ref('manual')
const selectedRobotId = ref<number>(1)

const scheduleDialogVisible = ref(false)
const scheduleForm = ref({
    name: '',
    targetType: 'MISSION' as 'TASK' | 'MISSION',
    targetId: 1,
    robotId: 1,
    cycleType: 'DAILY' as 'DAILY' | 'HOURLY' | 'WEEKLY' | 'CUSTOM',
    repeatType: 'PERMANENT' as 'PERMANENT' | 'COUNT',
    repeatCount: 10,
    eventCodeId: undefined as number | undefined,
})

const scheduleDailyTime = ref('09:00')
const scheduleHourlyInterval = ref(2)
const scheduleWeeklyDays = ref(['월', '수', '금'])
const scheduleWeeklyTime = ref('09:00')
const scheduleCustomCron = ref('매일 09:00')

const computedScheduleCronExpression = computed(() => {
    switch (scheduleForm.value.cycleType) {
        case 'DAILY':
            return `매일 ${scheduleDailyTime.value || '09:00'}`
        case 'HOURLY':
            return `${scheduleHourlyInterval.value || 1}시간 간격`
        case 'WEEKLY':
            return `매주 ${scheduleWeeklyDays.value.length ? scheduleWeeklyDays.value.join(',') : '월'} ${scheduleWeeklyTime.value || '09:00'}`
        case 'CUSTOM':
            return scheduleCustomCron.value || '매일 09:00'
        default:
            return '매일 09:00'
    }
})

const robots = ref<RobotOverviewItem[]>([
    { id: 1, name: '무인지게차 1호기', robotType: 'WORK', zoneName: 'ZONE A (장입구역)', x: 12.5, y: 8.2, batteryPercent: 88, operatingState: 'RUNNING', communicationStatus: 'ONLINE' },
    { id: 2, name: '저상형 AMR 1호기', robotType: 'WORK', zoneName: 'ZONE A (장입구역)', x: 18.0, y: 8.2, batteryPercent: 75, operatingState: 'SCHEDULE_RUNNING', communicationStatus: 'ONLINE' },
    { id: 3, name: '저상형 AMR 2호기', robotType: 'WORK', zoneName: 'ZONE A (대기구역)', x: 5.0, y: 3.5, batteryPercent: 92, operatingState: 'IDLE', communicationStatus: 'ONLINE' },
    { id: 4, name: '산업용 장입 로봇 1호기', robotType: 'WORK', zoneName: 'ZONE B (인수검사동)', x: 25.4, y: 15.6, batteryPercent: 64, operatingState: 'RUNNING', communicationStatus: 'ONLINE' },
    { id: 5, name: '편심 자율주행 로봇 1호기', robotType: 'SURVEILLANCE', zoneName: 'ZONE C (시설 험지)', x: 35.0, y: 12.0, batteryPercent: 81, operatingState: 'RUNNING', communicationStatus: 'ONLINE' },
    { id: 6, name: '4족 보행 로봇 1호기 (Spot)', robotType: 'SURVEILLANCE', zoneName: 'ZONE C (외곽 순찰)', x: 45.0, y: 30.0, batteryPercent: 95, operatingState: 'SCHEDULE_RUNNING', communicationStatus: 'ONLINE' },
    { id: 7, name: '실외 자율주행 로봇 1호기', robotType: 'SURVEILLANCE', zoneName: 'ZONE C (보행/차도)', x: 60.0, y: 12.0, batteryPercent: 90, operatingState: 'CHARGING', communicationStatus: 'ONLINE' },
])

const tasks = ref<TaskItem[]>([])
const missions = ref<MissionItem[]>([])
const logs = ref<RobotControlLog[]>([])
const schedules = ref<AutoControlSchedule[]>([])

const operatingRobotCount = computed(() => robots.value.filter(r => r.operatingState !== 'POWER_OFF').length)
const operatingRobots = computed(() => robots.value.filter(r => r.operatingState === 'IDLE' || r.operatingState === 'RUNNING' || r.operatingState === 'SCHEDULE_RUNNING'))
const selectedRobot = computed(() => robots.value.find(r => r.id === selectedRobotId.value) ?? null)

const stateLabel = (st: OperatingState) => {
    switch (st) {
        case 'RUNNING': return '수동 제어 중'
        case 'SCHEDULE_RUNNING': return '스케줄 실행 중'
        case 'IDLE': return '대기 중'
        case 'CHARGING': return '충전 중'
        case 'POWER_OFF': return '전원 꺼짐'
        case 'MANUAL_CONTROL': return '수동 제어 중'
        default: return st
    }
}

const stateVariant = (st: OperatingState) => {
    switch (st) {
        case 'RUNNING': return 'progress'
        case 'SCHEDULE_RUNNING': return 'progress'
        case 'IDLE': return 'muted'
        case 'CHARGING': return 'success'
        default: return 'muted'
    }
}

const selectRobot = (id: number) => {
    selectedRobotId.value = id
}

const openScheduleDialog = () => {
    scheduleForm.value = {
        name: '',
        targetType: 'MISSION',
        targetId: missions.value[0]?.id ?? 1,
        robotId: selectedRobotId.value,
        cycleType: 'DAILY',
        repeatType: 'PERMANENT',
        repeatCount: 10,
        eventCodeId: undefined,
    }
    scheduleDailyTime.value = '09:00'
    scheduleHourlyInterval.value = 2
    scheduleWeeklyDays.value = ['월', '수', '금']
    scheduleWeeklyTime.value = '09:00'
    scheduleCustomCron.value = '매일 09:00'
    scheduleDialogVisible.value = true
}

const saveSchedule = () => {
    if (!scheduleForm.value.name.trim()) {
        ElMessage.warning('스케줄 명칭을 입력하세요.')
        return
    }

    const r = robots.value.find(bot => bot.id === scheduleForm.value.robotId)
    const mis = missions.value.find(m => m.id === scheduleForm.value.targetId)
    const taskItem = tasks.value.find(t => t.id === scheduleForm.value.targetId)

    const cycleText = computedScheduleCronExpression.value
    const repeatText = scheduleForm.value.repeatType === 'PERMANENT' ? '영구 반복' : `${scheduleForm.value.repeatCount}회 반복`

    schedules.value.unshift({
        id: Date.now(),
        name: scheduleForm.value.name,
        targetType: scheduleForm.value.targetType,
        missionId: scheduleForm.value.targetType === 'MISSION' ? scheduleForm.value.targetId : undefined,
        missionName: mis?.name,
        taskId: scheduleForm.value.targetType === 'TASK' ? scheduleForm.value.targetId : undefined,
        taskName: taskItem?.name,
        robotId: scheduleForm.value.robotId,
        robotName: r?.name || '로봇',
        cycleType: scheduleForm.value.cycleType as any,
        cronExpression: cycleText,
        repeatType: scheduleForm.value.repeatType,
        repeatCount: scheduleForm.value.repeatCount,
        repeatCondition: `${cycleText} (${repeatText})`,
        eventCodeId: scheduleForm.value.eventCodeId,
        eventCodeName: scheduleForm.value.eventCodeId === 1 ? 'EVT-PATROL-01' : scheduleForm.value.eventCodeId === 2 ? 'EVT-TRANSPORT-01' : undefined,
        status: 'ACTIVE',
        lastRunAt: null,
        nextRunAt: '2026-08-12 09:00:00',
    })

    scheduleDialogVisible.value = false
    ElMessage.success('신규 자동 제어 스케줄이 성공적으로 등록되었습니다.')
}

const toggleSchedule = (row: AutoControlSchedule) => {
    ElMessage.success(`스케줄 [${row.name}] 상태가 ${row.status === 'ACTIVE' ? '활성화' : '일시정지'}되었습니다.`)
}

const loadControlLogs = async () => {
    const logRes = await getControlLogs()
    logs.value = logRes.data ?? []
}

const loadData = async () => {
    const taskRes = await getTasks()
    const misRes = await getMissions()
    const schedRes = await getControlSchedules()

    tasks.value = taskRes.data ?? []
    missions.value = misRes.data ?? []
    schedules.value = schedRes.data ?? []
    await loadControlLogs()
}

onMounted(() => {
    void loadData()
})
</script>

<style scoped lang="scss">
.robot-control-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 0;
}

.robots-overview-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-glass-color);
    border-radius: 10px;

    .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title-left {
            display: flex;
            align-items: center;
            gap: 8px;

            .title-text {
                font-size: 14px;
                font-weight: 700;
                color: var(--text-color--primary);
            }

            .title-sub {
                font-size: 12px;
                color: var(--text-color--secondary);
            }
        }

        .active-count {
            font-size: 13px;
            color: var(--text-color--secondary);

            strong {
                color: var(--primary-color);
                font-weight: 700;
            }
        }
    }
}

.robots-card-scroll-wrap {
    width: 100%;
    height: 122px;
    overflow-x: auto;
    overflow-y: hidden;

    &::-webkit-scrollbar {
        height: 6px;
    }
    &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.15);

        &:hover {
            background-color: var(--overlay-scrollbar-thumb-color);
            cursor: pointer;
        }
    }
}

.robots-card-grid {
    display: flex;
    gap: 12px;
}

.robot-overview-card {
    flex: 0 0 215px;
    min-width: 215px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: rgba(180, 70, 210, 0.4);
        background: rgba(180, 70, 210, 0.08);
    }

    &.is-selected {
        border-color: var(--primary-color);
        background: rgba(180, 70, 210, 0.15);
        box-shadow: 0 0 12px rgba(180, 70, 210, 0.35);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .robot-type-tag {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;

        &.work {
            background: rgba(56, 189, 248, 0.12);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.25);
        }
        &.surveillance {
            background: rgba(192, 132, 252, 0.12);
            color: #c084fc;
            border: 1px solid rgba(192, 132, 252, 0.25);
        }
    }

    .card-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-color--primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
    }

    .card-details {
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 12px;
        color: var(--text-color--secondary);

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .text-zone {
            color: var(--text-color--secondary);
            font-size: 11px;
        }

        .text-battery {
            color: #34d399;
            font-weight: 700;
        }
    }
}

.control-main-tabs {
    margin-top: 0;
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
    }
}

.hourly-picker-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .unit-txt {
        font-size: 14px;
        color: var(--text-color--secondary);
    }
}

.weekly-picker-box {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.preset-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;

    .preset-label {
        font-size: 12px;
        color: var(--secondary-color);
    }

    .preset-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass-color);
        color: var(--primary-color);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.18s ease;

        &:hover {
            background: rgba(231, 109, 255, 0.2);
        }
    }
}

.schedule-summary-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-glass-color);
    padding: 10px 14px;
    border-radius: 8px;
    margin-top: 4px;
    margin-bottom: 8px;

    .summary-icon {
        font-size: 16px;
    }

    .summary-label {
        font-size: 13px;
        color: var(--secondary-color);
        font-weight: 500;
    }

    .summary-value {
        font-size: 14px;
        font-weight: 700;
        color: var(--primary-color);
    }
}
</style>
