<template>
    <BaseDialog
        :model-value="visible"
        @update:model-value="$emit('update:visible', $event)"
        class="control-dialog"
        :title="`${robot?.name ?? ''} 수동 원격 제어`"
        width="560px"
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

            <div v-if="commandForm.commandType === 'MOVE_TO'" class="grid-2col">
                <el-form-item label="목적지 X (m)" required>
                    <el-input-number v-model="commandForm.x" :precision="2" style="width:100%" />
                </el-form-item>
                <el-form-item label="목적지 Y (m)" required>
                    <el-input-number v-model="commandForm.y" :precision="2" style="width:100%" />
                </el-form-item>
            </div>

            <el-form-item v-else-if="commandForm.commandType === 'SET_MODE'" label="운영 모드">
                <el-radio-group v-model="commandForm.mode">
                    <el-radio-button value="AUTO">자동 (AUTO)</el-radio-button>
                    <el-radio-button value="MANUAL">수동 (MANUAL)</el-radio-button>
                    <el-radio-button value="PAUSED">일시정지 (PAUSED)</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="$emit('update:visible', false)">취소</el-button>
            <el-button type="primary" :loading="saving" @click="submitCommand">명령 집행</el-button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { simulationService } from '@/services/simulation.service'
import type { MonitoringRobot } from '../service/integrated/integratedMonitoring.types'
import type { RobotCommandType } from '../service/typed/typedMonitoring.api'

const props = defineProps<{
    visible: boolean
    robot: MonitoringRobot | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void
}>()

const saving = ref(false)

const commandForm = reactive({
    commandType: 'MOVE_TO' as RobotCommandType,
    x: 15.0,
    y: 10.0,
    mode: 'AUTO',
    missionId: 1,
})

watch(() => props.robot, (newRobot) => {
    if (newRobot) {
        commandForm.x = newRobot.x
        commandForm.y = newRobot.y
    }
}, { immediate: true })

const submitCommand = async () => {
    if (!props.robot) return
    saving.value = true
    try {
        simulationService.applyCommand(props.robot.id, commandForm.commandType, {
            x: commandForm.x,
            y: commandForm.y,
            mode: commandForm.mode,
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
