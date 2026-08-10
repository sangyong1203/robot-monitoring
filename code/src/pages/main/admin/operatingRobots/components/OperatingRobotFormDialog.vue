<template>
    <BaseDialog
        :model-value="modelValue"
        :title="isEdit ? '운영 로봇 정보 수정' : '신규 운영 로봇 등록'"
        description="현장에 실제 설치/배치되는 로봇 정보 및 모델 연동을 설정합니다."
        width="640px"
        :buttonTypes="['Cancel', 'Save']"
        @update:model-value="val => emit('update:modelValue', val)"
        @onSave="handleSave"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
            <el-form-item label="운영 로봇 명칭" prop="name">
                <el-input v-model="form.name" placeholder="예: 무인지게차 1호기" />
            </el-form-item>

            <el-form-item label="로봇 식별 코드 (ID)" prop="robotCode">
                <el-input v-model="form.robotCode" placeholder="예: RB-FORKLIFT-01" />
            </el-form-item>

            <el-form-item label="원형 로봇 모델 연동" prop="modelId">
                <el-select v-model="form.modelId" style="width: 100%" @change="handleModelChange">
                    <el-option v-for="m in modelOptions" :key="m.id" :label="m.name" :value="m.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="설치 기관 및 구역" prop="orgId">
                <el-select v-model="form.orgId" style="width: 100%" @change="handleOrgChange">
                    <el-option v-for="org in orgOptions" :key="org.id" :label="org.name" :value="org.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="기본 할당 지도" prop="mapId">
                <el-select v-model="form.mapId" style="width: 100%">
                    <el-option v-for="map in mapOptions" :key="map.id" :label="map.name" :value="map.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="운영 여부">
                <el-checkbox v-model="form.isOperating">현장 운영 중 상태 활성화</el-checkbox>
            </el-form-item>

            <el-form-item label="초기 위치 (X, Y 미터)" style="grid-column: span 2">
                <div style="display: flex; gap: 16px">
                    <el-input-number v-model="form.x" :precision="2" :step="0.5" placeholder="X 미터" style="width: 50%" />
                    <el-input-number v-model="form.y" :precision="2" :step="0.5" placeholder="Y 미터" style="width: 50%" />
                </div>
            </el-form-item>

            <el-form-item label="메모 및 특이사항" style="grid-column: span 2">
                <el-input v-model="form.memo" type="textarea" :rows="2" placeholder="로봇 배치 특이사항 입력" />
            </el-form-item>
        </el-form>
    </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { saveOperatingRobot } from '../service/operatingRobots.api'
import type { OperatingRobotItem, SaveOperatingRobotPayload } from '../service/operatingRobots.types'

const props = defineProps<{
    modelValue: boolean
    isEdit: boolean
    initialData?: OperatingRobotItem | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const formRef = ref()

const modelOptions = [
    { id: 1, name: 'KORAD 실내 중량물 무인지게차 (1.5t)', type: 'FORKLIFT', manufacturer: '두산로보틱스' },
    { id: 2, name: 'KORAD 처분용기 전용 저상형 AMR', type: 'AMR', manufacturer: '현대로보틱스' },
    { id: 3, name: '6축 산업용 처분용기 정밀 장입 로봇', type: 'INDUSTRIAL_ARM', manufacturer: 'HD현대로보틱스' },
    { id: 4, name: '편심 주행 중간 험지 감시 로봇', type: 'ECCENTRIC_ROBOT', manufacturer: '레인보우로보틱스' },
    { id: 5, name: '4족 보행 외곽 경계 및 복합 험지 로봇', type: 'QUADRUPED_ROBOT', manufacturer: '보스턴다이나믹스 (Spot)' },
    { id: 6, name: '실외 자율주행 보행로 및 일반차도 감시 로봇', type: 'OUTDOOR_ROBOT', manufacturer: '트위니' },
]

const orgOptions = [
    { id: 1, name: 'KORAD 경주 본원' },
    { id: 2, name: 'KORAD 경주 본원 > 처분시설 운영센터' },
    { id: 3, name: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소' },
]

const mapOptions = [
    { id: 1, name: '처분용기 장입 실내 1층 도면' },
    { id: 2, name: '외곽 시설물 정밀 순찰 2D 지도' },
]

const form = reactive<SaveOperatingRobotPayload>({
    id: undefined,
    robotCode: '',
    name: '',
    modelId: 1,
    modelName: 'KORAD 실내 중량물 무인지게차 (1.5t)',
    robotType: 'FORKLIFT',
    manufacturer: '두산로보틱스',
    orgId: 2,
    orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
    mapId: 1,
    mapName: '처분용기 장입 실내 1층 도면',
    x: 10,
    y: 10,
    heading: 0,
    memo: '',
    isOperating: true,
})

const rules = {
    name: [{ required: true, message: '로봇 명칭을 입력하세요.', trigger: 'blur' }],
    robotCode: [{ required: true, message: '로봇 식별 코드를 입력하세요.', trigger: 'blur' }],
}

const handleModelChange = (modelId: number) => {
    const found = modelOptions.find(m => m.id === modelId)
    if (found) {
        form.modelName = found.name
        form.robotType = found.type as any
        form.manufacturer = found.manufacturer
    }
}

const handleOrgChange = (orgId: number) => {
    const found = orgOptions.find(o => o.id === orgId)
    if (found) {
        form.orgPath = found.name
    }
}

watch(
    () => props.modelValue,
    visible => {
        if (visible) {
            if (props.isEdit && props.initialData) {
                Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
            } else {
                form.id = undefined
                form.robotCode = `RB-NEW-${Date.now().toString().slice(-4)}`
                form.name = ''
                form.modelId = 1
                handleModelChange(1)
                form.orgId = 2
                handleOrgChange(2)
                form.mapId = 1
                form.mapName = '처분용기 장입 실내 1층 도면'
                form.x = 10
                form.y = 10
                form.heading = 0
                form.memo = ''
                form.isOperating = true
            }
        }
    },
)

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveOperatingRobot(form)
            ElMessage.success(props.isEdit ? '운영 로봇 정보가 수정되었습니다.' : '신규 운영 로봇이 등록되었습니다.')
            emit('update:modelValue', false)
            emit('saved')
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}
</script>
