<template>
    <div class="robot-control-page">
        <Panel title="로봇 제어 및 스케줄 관리" subtitle="수동 명령 요청, 즉시 제어, 자동 제어 스케줄 및 실행 이력">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="로봇 수동 제어" name="manual">
                    <div class="control-grid">
                        <div class="control-card">
                            <h3>로봇 수동 명령 실행</h3>
                            <el-form label-position="top">
                                <el-form-item label="제어 대상 운영 로봇" required>
                                    <el-select v-model="selectedRobotId" placeholder="로봇 선택">
                                        <el-option
                                            v-for="r in robotOptions"
                                            :key="r.id"
                                            :label="`${r.name} (${r.status})`"
                                            :value="r.id"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="명령 유형" required>
                                    <el-select v-model="commandType">
                                        <el-option label="목적지 이동 (MOVE_TO)" value="MOVE_TO" />
                                        <el-option label="운영 모드 변경 (SET_MODE)" value="SET_MODE" />
                                        <el-option label="미션 시작 (START_MISSION)" value="START_MISSION" />
                                        <el-option label="Safe Stop (안전 정지)" value="SAFE_STOP" />
                                        <el-option label="원격 비상정지 (E_STOP)" value="E_STOP" />
                                    </el-select>
                                </el-form-item>

                                <div v-if="commandType === 'MOVE_TO'" class="coordinate-inputs">
                                    <el-form-item label="목적지 좌표 X (m)">
                                        <el-input-number v-model="targetX" :precision="2" />
                                    </el-form-item>
                                    <el-form-item label="목적지 좌표 Y (m)">
                                        <el-input-number v-model="targetY" :precision="2" />
                                    </el-form-item>
                                </div>

                                <el-form-item v-else-if="commandType === 'SET_MODE'" label="운영 모드 선택">
                                    <el-radio-group v-model="targetMode">
                                        <el-radio-button value="AUTO">자동 (AUTO)</el-radio-button>
                                        <el-radio-button value="MANUAL">수동 (MANUAL)</el-radio-button>
                                        <el-radio-button value="PAUSED">일시정지 (PAUSED)</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>

                                <el-form-item v-else-if="commandType === 'START_MISSION'" label="시작할 미션 선택">
                                    <el-select v-model="selectedMissionId" placeholder="미션 선택">
                                        <el-option label="[융합] 폐기물 이송 및 처분용기 장입" :value="1" />
                                        <el-option label="외곽 험지 순찰 미션" :value="2" />
                                    </el-select>
                                </el-form-item>

                                <el-form-item v-if="commandType === 'SAFE_STOP' || commandType === 'E_STOP'" label="정지 사유">
                                    <el-input v-model="stopReason" placeholder="비상 정지 사유 기재" />
                                </el-form-item>

                                <el-alert
                                    type="info"
                                    title="중요 제어 명령 전송 시 비밀번호 재확인 및 이력이 기록됩니다."
                                    :closable="false"
                                    style="margin-bottom: 16px"
                                />

                                <el-button
                                    :type="commandType === 'E_STOP' || commandType === 'SAFE_STOP' ? 'danger' : 'primary'"
                                    style="width: 100%"
                                    @click="submitCommand"
                                >
                                    명령 전송
                                </el-button>
                            </el-form>
                        </div>

                        <div class="control-logs">
                            <h3>최근 제어 이력</h3>
                            <el-table :data="logs" stripe style="width: 100%">
                                <el-table-column prop="requestedAt" label="요청 시각" width="180" />
                                <el-table-column prop="robotName" label="로봇" width="140" />
                                <el-table-column prop="commandType" label="명령 유형" width="140" />
                                <el-table-column prop="payloadSummary" label="세부 내용" min-width="180" />
                                <el-table-column label="상태" width="100">
                                    <template #default="{ row }">
                                        <StatusBadge :label="row.status" :variant="row.status === 'APPLIED' ? 'success' : 'info'" />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="자동 제어 스케줄" name="schedules">
                    <TableToolbar>
                        <template #right>
                            <el-button type="primary" @click="openScheduleDialog">신규 스케줄 등록</el-button>
                        </template>
                    </TableToolbar>

                    <el-table :data="schedules" stripe style="width: 100%">
                        <el-table-column prop="name" label="스케줄 명칭" min-width="200" />
                        <el-table-column prop="missionName" label="연계 미션" width="200" />
                        <el-table-column prop="robotName" label="대상 로봇" width="180" />
                        <el-table-column prop="repeatCondition" label="반복 조건" width="160" />
                        <el-table-column label="상태" width="100">
                            <template #default="{ row }">
                                <StatusBadge :label="row.status" :variant="row.status === 'ACTIVE' ? 'success' : 'warning'" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="nextRunAt" label="다음 실행 예정" width="170" />
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Panel from '@/components/Panel.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { simulationService } from '@/services/simulation.service'
import { getControlLogs, getControlSchedules } from './service/robotControl.api'
import type { RobotControlLog, AutoControlSchedule } from './service/robotControl.types'

const activeTab = ref('manual')
const selectedRobotId = ref<number>(1)
const commandType = ref<'MOVE_TO' | 'SET_MODE' | 'START_MISSION' | 'SAFE_STOP' | 'E_STOP'>('MOVE_TO')
const targetX = ref(15.0)
const targetY = ref(10.0)
const targetMode = ref('AUTO')
const selectedMissionId = ref(1)
const stopReason = ref('')

const robotOptions = ref([
    { id: 1, name: '무인지게차 1호기', status: 'RUNNING' },
    { id: 2, name: '저상형 AMR 1호기', status: 'RUNNING' },
    { id: 3, name: '저상형 AMR 2호기', status: 'IDLE' },
    { id: 4, name: '산업용 장입 로봇 1호기', status: 'RUNNING' },
    { id: 5, name: '편심 자율주행 로봇 1호기', status: 'RUNNING' },
    { id: 6, name: '4족 보행 로봇 1호기 (Spot)', status: 'RUNNING' },
    { id: 7, name: '실외 자율주행 로봇 1호기', status: 'RUNNING' },
])

const logs = ref<RobotControlLog[]>([])
const schedules = ref<AutoControlSchedule[]>([])

onMounted(async () => {
    const lRes = await getControlLogs()
    const sRes = await getControlSchedules()
    logs.value = lRes.data ?? []
    schedules.value = sRes.data ?? []
})

const submitCommand = async () => {
    const targetRobot = robotOptions.value.find(r => r.id === selectedRobotId.value)
    if (!targetRobot) return

    if (commandType.value === 'E_STOP' || commandType.value === 'SAFE_STOP') {
        try {
            await ElMessageBox.confirm(
                `[${targetRobot.name}]에 ${commandType.value} 명령을 전송하시겠습니까?`,
                '비상 명령 확인',
                { type: 'error', confirmButtonText: '전송', cancelButtonText: '취소' },
            )
        } catch {
            return
        }
    }

    // Apply to simulation in mock mode
    simulationService.applyCommand(selectedRobotId.value, commandType.value, {
        x: targetX.value,
        y: targetY.value,
        mode: targetMode.value,
        missionId: selectedMissionId.value,
    })

    let payloadStr = ''
    if (commandType.value === 'MOVE_TO') payloadStr = `X: ${targetX.value}m, Y: ${targetY.value}m`
    else if (commandType.value === 'SET_MODE') payloadStr = `모드: ${targetMode.value}`
    else if (commandType.value === 'START_MISSION') payloadStr = `미션 ID: ${selectedMissionId.value}`
    else payloadStr = `사유: ${stopReason.value || '관제 원격 정지'}`

    logs.value.unshift({
        id: Date.now(),
        robotId: selectedRobotId.value,
        robotName: targetRobot.name,
        commandType: commandType.value,
        payloadSummary: payloadStr,
        requestedBy: '운영자 (operator)',
        requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: 'APPLIED',
    })

    ElMessage.success(`${targetRobot.name}에 ${commandType.value} 명령이 전송되었습니다.`)
}

const openScheduleDialog = () => {
    ElMessage.info('자동 제어 스케줄 등록 창이 열립니다.')
}
</script>

<style scoped lang="scss">
.robot-control-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.control-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 20px;
}

.control-card, .control-logs {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 20px;

    h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 16px;
    }
}

.coordinate-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>
