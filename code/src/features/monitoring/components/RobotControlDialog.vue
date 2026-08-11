<template>
    <BaseDialog
        :model-value="visible"
        @update:model-value="$emit('update:visible', $event)"
        class="control-dialog"
        :title="`${robot?.name ?? ''} 수동 원격 제어`"
        width="600px"
    >
        <el-form label-position="top">
            <el-form-item label="명령 유형" required>
                <el-select v-model="commandForm.commandType" style="width:100%">
                    <el-option label="목적지 좌표 이동 (MOVE_TO)" value="MOVE_TO" />
                    <el-option label="운영 모드 변경 (SET_MODE)" value="SET_MODE" />
                    <el-option label="미션 시작 (START_MISSION)" value="START_MISSION" />
                    <el-option label="Safe Stop (안전 정지)" value="SAFE_STOP" />
                </el-select>
            </el-form-item>

            <template v-if="commandForm.commandType === 'MOVE_TO'">
                <el-form-item label="등록 목적지 (POI) 선택">
                    <el-select
                        v-model="selectedDestinationId"
                        placeholder="목적지 선택 시 좌표 자동입력"
                        style="width: 100%"
                        clearable
                        @change="handleDestinationChange"
                    >
                        <el-option
                            v-for="dest in filteredDestinations"
                            :key="dest.id"
                            :label="`[${dest.type}] ${dest.name} (${dest.mapName})`"
                            :value="dest.id"
                        />
                    </el-select>
                </el-form-item>

                <div class="grid-2col">
                    <el-form-item label="목적지 X (m)" required>
                        <el-input-number v-model="commandForm.x" :precision="2" style="width:100%" />
                    </el-form-item>
                    <el-form-item label="목적지 Y (m)" required>
                        <el-input-number v-model="commandForm.y" :precision="2" style="width:100%" />
                    </el-form-item>
                </div>
            </template>

            <el-form-item v-else-if="commandForm.commandType === 'SET_MODE'" label="운영 모드">
                <el-radio-group v-model="commandForm.mode">
                    <el-radio-button value="AUTO">자동 (AUTO)</el-radio-button>
                    <el-radio-button value="MANUAL">수동 (MANUAL)</el-radio-button>
                    <el-radio-button value="PAUSED">일시정지 (PAUSED)</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-form-item v-else-if="commandForm.commandType === 'START_MISSION'" label="실행할 미션 선택" required>
                <el-select v-model="commandForm.missionId" style="width:100%" placeholder="미션 선택">
                    <el-option
                        v-for="mis in missions"
                        :key="mis.id"
                        :label="`[${mis.code}] ${mis.name}`"
                        :value="mis.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="$emit('update:visible', false)">취소</el-button>
            <el-button type="primary" :loading="saving" @click="submitCommand">명령 집행</el-button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { simulationService } from '@/services/simulation.service'
import type { MonitoringRobot } from '../service/integrated/integratedMonitoring.types'
import type { RobotCommandType } from '../service/typed/typedMonitoring.api'
import { fetchMockDestinations } from '@/pages/main/admin/destinations/service/destinations.mock'
import type { DestinationItem } from '@/pages/main/admin/destinations/service/destinations.types'
import { getMissions } from '@/pages/main/admin/missions/service/missionManagement.api'
import type { MissionItem } from '@/pages/main/admin/missions/service/missionManagement.types'

const props = defineProps<{
    visible: boolean
    robot: MonitoringRobot | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void
}>()

const saving = ref(false)
const destinations = ref<DestinationItem[]>([])
const missions = ref<MissionItem[]>([])
const selectedDestinationId = ref<number | null>(null)

const commandForm = reactive({
    commandType: 'MOVE_TO' as RobotCommandType,
    x: 15.0,
    y: 10.0,
    siteX: undefined as number | undefined,
    siteY: undefined as number | undefined,
    mode: 'AUTO',
    missionId: 1,
})

const filteredDestinations = computed(() => {
    if (!props.robot) return destinations.value
    return destinations.value.filter(d => {
        if (!d.targetRobotType || d.targetRobotType === 'ALL') return true
        return d.targetRobotType === props.robot?.robotType
    })
})

const loadData = async () => {
    destinations.value = await fetchMockDestinations()
    const misRes = await getMissions()
    missions.value = misRes.data ?? []
}

onMounted(() => {
    void loadData()
})

watch(() => props.visible, (val) => {
    if (val) {
        void loadData()
        if (props.robot) {
            commandForm.x = props.robot.x
            commandForm.y = props.robot.y
            commandForm.siteX = props.robot.siteX
            commandForm.siteY = props.robot.siteY
        }
    }
})

const handleDestinationChange = (destId: number | null) => {
    if (!destId) return
    const target = destinations.value.find(d => d.id === destId)
    if (target) {
        commandForm.x = target.x
        commandForm.y = target.y
        commandForm.siteX = target.siteX
        commandForm.siteY = target.siteY
        ElMessage.info(`목적지 '${target.name}' 좌표가 입력되었습니다.`)
    }
}

const submitCommand = async () => {
    if (!props.robot) return
    saving.value = true
    try {
        simulationService.applyCommand(props.robot.id, commandForm.commandType, {
            x: commandForm.x,
            y: commandForm.y,
            siteX: commandForm.siteX,
            siteY: commandForm.siteY,
            mode: commandForm.mode,
            missionId: commandForm.missionId,
        })
        ElMessage.success(`${props.robot.name}에 명령이 접수되었습니다.`)
        emit('update:visible', false)
    } finally {
        saving.value = false
    }
}
</script>

<style scoped lang="scss">
.grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>
