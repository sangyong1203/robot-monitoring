<template>
    <BaseDialog
        :model-value="modelValue"
        :title="isEdit ? '로봇 모델 사양 및 모니터링 항목 수정' : '신규 로봇 모델 등록'"
        description="로봇 제조사, OS, 제어 기능 및 카메라/센서 모니터링 그룹을 설정합니다."
        width="720px"
        :buttonTypes="['Cancel', 'Save']"
        @update:model-value="val => emit('update:modelValue', val)"
        @onSave="handleSave"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
            <el-form-item label="로봇 모델명" prop="modelName">
                <el-input v-model="form.modelName" placeholder="예: KORAD 실내 중량물 무인지게차 (1.5t)" />
            </el-form-item>

            <el-form-item label="모델 식별 코드" prop="modelCode">
                <el-input v-model="form.modelCode" placeholder="예: MODEL-FORKLIFT-01" />
            </el-form-item>

            <el-form-item label="로봇 종류" prop="robotType">
                <el-select v-model="form.robotType" placeholder="로봇 종류 선택" style="width: 100%">
                    <el-option label="무인지게차 (FORKLIFT)" value="FORKLIFT" />
                    <el-option label="저상형 AMR (AMR)" value="AMR" />
                    <el-option label="산업용 로봇 (INDUSTRIAL_ARM)" value="INDUSTRIAL_ARM" />
                    <el-option label="편심 자율주행 로봇 (ECCENTRIC_ROBOT)" value="ECCENTRIC_ROBOT" />
                    <el-option label="4족 보행 로봇 (QUADRUPED_ROBOT)" value="QUADRUPED_ROBOT" />
                    <el-option label="실외 자율주행 로봇 (OUTDOOR_ROBOT)" value="OUTDOOR_ROBOT" />
                </el-select>
            </el-form-item>

            <el-form-item label="제조사 명칭" prop="manufacturer">
                <el-input v-model="form.manufacturer" placeholder="제조사 입력" />
            </el-form-item>

            <el-form-item label="탑재 OS / 플랫폼" prop="os">
                <el-input v-model="form.os" placeholder="예: ROS2 Humble, Ubuntu 22.04" />
            </el-form-item>

            <el-form-item label="모델 사용 상태">
                <el-checkbox v-model="form.isActive">로봇 모델 사용 활성화</el-checkbox>
            </el-form-item>

            <el-form-item label="제어 기능 지원 활성화" style="grid-column: span 2">
                <div style="display: flex; gap: 24px">
                    <el-checkbox v-model="form.monitoringOptions.supportDestinationControl">목적지 이동 제어 지원</el-checkbox>
                    <el-checkbox v-model="form.monitoringOptions.supportManualControl">수동 주행 조종 지원</el-checkbox>
                    <el-checkbox v-model="form.monitoringOptions.supportScreenShare">메인 디스플레이 화면 공유 지원</el-checkbox>
                </div>
            </el-form-item>

            <el-form-item label="카메라 채널 목록 (쉼표 구분)" style="grid-column: span 2">
                <el-input v-model="cameraChannelsText" placeholder="예: 전방 카메라, 후방 카메라, 열화상 카메라" />
            </el-form-item>

            <el-form-item label="활성화 센서 그룹 (쉼표 구분)" style="grid-column: span 2">
                <el-input v-model="sensorsText" placeholder="예: Lidar, 가스 센서, 하중 센서, 배터리 BMS" />
            </el-form-item>
        </el-form>
    </BaseDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { saveRobotModel } from '../service/robotModels.api'
import type { RobotModelItem, SaveRobotModelPayload } from '../service/robotModels.types'

const props = defineProps<{
    modelValue: boolean
    isEdit: boolean
    initialData?: RobotModelItem | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const formRef = ref()

const form = reactive<SaveRobotModelPayload>({
    id: undefined,
    modelCode: '',
    modelName: '',
    robotType: 'FORKLIFT',
    manufacturer: '',
    os: '',
    imageUrl: '',
    settings: [],
    monitoringOptions: {
        supportDestinationControl: true,
        supportManualControl: true,
        cameraChannels: ['전방 카메라'],
        supportScreenShare: true,
        enabledSensors: ['Lidar', 'BMS'],
    },
    isActive: true,
})

const cameraChannelsText = computed({
    get: () => form.monitoringOptions.cameraChannels.join(', '),
    set: val => {
        form.monitoringOptions.cameraChannels = val.split(',').map(s => s.trim()).filter(Boolean)
    },
})

const sensorsText = computed({
    get: () => form.monitoringOptions.enabledSensors.join(', '),
    set: val => {
        form.monitoringOptions.enabledSensors = val.split(',').map(s => s.trim()).filter(Boolean)
    },
})

const rules = {
    modelName: [{ required: true, message: '모델명을 입력하세요.', trigger: 'blur' }],
    modelCode: [{ required: true, message: '모델 코드를 입력하세요.', trigger: 'blur' }],
    manufacturer: [{ required: true, message: '제조사를 입력하세요.', trigger: 'blur' }],
}

watch(
    () => props.modelValue,
    visible => {
        if (visible) {
            if (props.isEdit && props.initialData) {
                Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
            } else {
                form.id = undefined
                form.modelCode = `MODEL-${Date.now().toString().slice(-4)}`
                form.modelName = ''
                form.robotType = 'FORKLIFT'
                form.manufacturer = ''
                form.os = 'ROS2'
                form.monitoringOptions = {
                    supportDestinationControl: true,
                    supportManualControl: true,
                    cameraChannels: ['전방 카메라', '후방 카메라'],
                    supportScreenShare: true,
                    enabledSensors: ['Lidar', 'BMS'],
                }
                form.isActive = true
            }
        }
    },
)

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveRobotModel(form)
            ElMessage.success(props.isEdit ? '로봇 모델 정보가 수정되었습니다.' : '신규 로봇 모델이 등록되었습니다.')
            emit('update:modelValue', false)
            emit('saved')
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}
</script>
