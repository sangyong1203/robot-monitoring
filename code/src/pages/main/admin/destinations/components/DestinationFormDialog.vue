<template>
    <BaseDialog
        :model-value="modelValue"
        :title="isEdit ? '목적지 정보 수정' : '신규 목적지 등록'"
        description="지도 상의 로봇 이동 및 작업 좌표(X, Y)와 방향(Heading) 및 종합 배치도 연동 좌표를 지정합니다."
        width="660px"
        :buttonTypes="['Cancel', 'Save']"
        @update:model-value="val => emit('update:modelValue', val)"
        @onSave="handleSave"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
            <el-form-item label="목적지 이름" prop="name">
                <el-input v-model="form.name" placeholder="예: 무인지게차 팰릿 상차지점 A" />
            </el-form-item>

            <el-form-item label="목적지 코드" prop="code">
                <el-input v-model="form.code" placeholder="예: DEST-WORK-01" />
            </el-form-item>

            <el-form-item label="목적지 타입" prop="type">
                <el-select v-model="form.type" style="width: 100%">
                    <el-option label="작업 지점 (WORK_SPOT)" value="WORK_SPOT" />
                    <el-option label="대기 지점 (WAITING_SPOT)" value="WAITING_SPOT" />
                    <el-option label="충전 스테이션 (CHARGING_STATION)" value="CHARGING_STATION" />
                    <el-option label="순찰 웨이포인트 (PATROL_WAYPOINT)" value="PATROL_WAYPOINT" />
                    <el-option label="저장 구역 (STORAGE_AREA)" value="STORAGE_AREA" />
                </el-select>
            </el-form-item>

            <el-form-item label="적용 대상 로봇">
                <el-select v-model="form.targetRobotType" style="width: 100%">
                    <el-option label="전체 로봇 공용 (ALL)" value="ALL" />
                    <el-option label="작업 로봇 전용 (WORK)" value="WORK" />
                    <el-option label="감시 로봇 전용 (SURVEILLANCE)" value="SURVEILLANCE" />
                </el-select>
            </el-form-item>

            <el-form-item label="소속 지도 명칭" style="grid-column: span 2">
                <el-input :model-value="mapName" disabled />
            </el-form-item>

            <el-form-item label="구역 지도 X 좌표 (m)" prop="x">
                <el-input-number v-model="form.x" :precision="2" :step="0.5" style="width: 100%" />
            </el-form-item>

            <el-form-item label="구역 지도 Y 좌표 (m)" prop="y">
                <el-input-number v-model="form.y" :precision="2" :step="0.5" style="width: 100%" />
            </el-form-item>

            <el-form-item label="종합 배치도 X 좌표 (siteX)">
                <el-input-number v-model="form.siteX" :precision="2" :step="0.5" placeholder="자동/오버라이드" style="width: 100%" />
            </el-form-item>

            <el-form-item label="종합 배치도 Y 좌표 (siteY)">
                <el-input-number v-model="form.siteY" :precision="2" :step="0.5" placeholder="자동/오버라이드" style="width: 100%" />
            </el-form-item>

            <el-form-item label="방향 각도 Heading (0°~360°)" prop="heading" style="grid-column: span 2">
                <el-slider v-model="form.heading" :min="0" :max="360" show-input />
            </el-form-item>

            <el-form-item label="목적지 설명" style="grid-column: span 2">
                <el-input v-model="form.description" type="textarea" :rows="2" placeholder="목적지 업무 용도 설명" />
            </el-form-item>
        </el-form>
    </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { saveDestination } from '../service/destinations.api'
import type { DestinationItem, SaveDestinationPayload, TargetRobotType } from '../service/destinations.types'

const props = defineProps<{
    modelValue: boolean
    isEdit: boolean
    mapId: number
    mapName: string
    initialData?: DestinationItem | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const formRef = ref()

const form = reactive<SaveDestinationPayload>({
    id: undefined,
    mapId: props.mapId,
    name: '',
    code: '',
    type: 'WORK_SPOT',
    x: 10,
    y: 10,
    siteX: undefined,
    siteY: undefined,
    heading: 0,
    targetRobotType: 'ALL',
    description: '',
    isActive: true,
})

const rules = {
    name: [{ required: true, message: '목적지 이름을 입력하세요.', trigger: 'blur' }],
    code: [{ required: true, message: '목적지 코드를 입력하세요.', trigger: 'blur' }],
}

watch(
    () => props.modelValue,
    visible => {
        if (visible) {
            if (props.isEdit && props.initialData) {
                Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
            } else {
                form.id = undefined
                form.mapId = props.mapId
                form.name = ''
                form.code = `DEST-${Date.now().toString().slice(-4)}`
                form.type = 'WORK_SPOT'
                form.x = (props.initialData as any)?.x ?? 10
                form.y = (props.initialData as any)?.y ?? 10
                form.siteX = undefined
                form.siteY = undefined
                form.heading = 0
                form.targetRobotType = 'ALL'
                form.description = ''
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
            await saveDestination({
                ...form,
                mapName: props.mapName,
            })
            ElMessage.success(props.isEdit ? '목적지가 수정되었습니다.' : '신규 목적지가 등록되었습니다.')
            emit('update:modelValue', false)
            emit('saved')
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}
</script>
