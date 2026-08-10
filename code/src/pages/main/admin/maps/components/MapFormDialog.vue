<template>
    <BaseDialog
        :model-value="modelValue"
        :title="isEdit ? '지도 정보 수정' : '신규 지도 등록'"
        description="2D 공간 도면 파일과 좌표 해상도 및 대표 지도 설정을 지정합니다."
        width="680px"
        :buttonTypes="['Cancel', 'Save']"
        @update:model-value="val => emit('update:modelValue', val)"
        @onSave="handleSave"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
            <el-form-item label="지도 이름" prop="name">
                <el-input v-model="form.name" placeholder="예: 처분용기 장입 실내 1층 도면" />
            </el-form-item>

            <el-form-item label="지도 식별 코드" prop="code">
                <el-input v-model="form.code" placeholder="예: MAP-INDOOR-01" />
            </el-form-item>

            <el-form-item label="소속 지역 / 구역" prop="zoneName">
                <el-input v-model="form.zoneName" placeholder="구역 명칭 입력" />
            </el-form-item>

            <el-form-item label="지도 구분" prop="mapType">
                <el-select v-model="form.mapType" style="width: 100%">
                    <el-option label="실내 지도 (INDOOR)" value="INDOOR" />
                    <el-option label="실외 지도 (OUTDOOR)" value="OUTDOOR" />
                </el-select>
            </el-form-item>

            <el-form-item label="지도 픽셀 가로(Width)" prop="width">
                <el-input-number v-model="form.width" :min="100" :max="10000" style="width: 100%" />
            </el-form-item>

            <el-form-item label="지도 픽셀 세로(Height)" prop="height">
                <el-input-number v-model="form.height" :min="100" :max="10000" style="width: 100%" />
            </el-form-item>

            <el-form-item label="좌표 해상도 (m/px)" prop="resolution">
                <el-input-number v-model="form.resolution" :precision="3" :step="0.01" :min="0.001" style="width: 100%" />
            </el-form-item>

            <el-form-item label="원점 좌표 (Origin X, Y)" style="grid-column: span 1">
                <div style="display: flex; gap: 8px">
                    <el-input-number v-model="form.origin_x" placeholder="X" style="width: 50%" />
                    <el-input-number v-model="form.origin_y" placeholder="Y" style="width: 50%" />
                </div>
            </el-form-item>

            <el-form-item label="지도 사용 및 대표 설정" style="grid-column: span 2">
                <div style="display: flex; gap: 24px">
                    <el-checkbox v-model="form.isPrimary">통합관제 대표 지도로 설정</el-checkbox>
                    <el-checkbox v-model="form.isActive">지도 활성화 사용</el-checkbox>
                </div>
            </el-form-item>

            <el-form-item label="지도 설명" style="grid-column: span 2">
                <el-input v-model="form.description" type="textarea" :rows="2" placeholder="지도 용도 및 구역 설명 입력" />
            </el-form-item>
        </el-form>
    </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { saveMap } from '../service/maps.api'
import type { MapItem, SaveMapPayload } from '../service/maps.types'

const props = defineProps<{
    modelValue: boolean
    isEdit: boolean
    initialData?: MapItem | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const formRef = ref()

const form = reactive<SaveMapPayload>({
    id: undefined,
    code: '',
    name: '',
    mapType: 'INDOOR',
    orgName: '중저준위 처분시설 운영센터',
    regionName: 'KORAD 경주 본원',
    zoneName: '실내 처분용기 장입구역',
    fileName: 'map.png',
    fileSize: 4500000,
    imageUrl: '/sample_map/map.png',
    width: 1200,
    height: 800,
    resolution: 0.05,
    originX: 0,
    originY: 0,
    origin_x: 0,
    origin_y: 0,
    isPrimary: false,
    isActive: true,
    description: '',
    registeredByName: '관리자',
})

const rules = {
    name: [{ required: true, message: '지도 이름을 입력하세요.', trigger: 'blur' }],
    code: [{ required: true, message: '지도 코드를 입력하세요.', trigger: 'blur' }],
}

watch(
    () => props.modelValue,
    visible => {
        if (visible) {
            if (props.isEdit && props.initialData) {
                Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
            } else {
                form.id = undefined
                form.name = ''
                form.code = `MAP-${Date.now().toString().slice(-4)}`
                form.mapType = 'INDOOR'
                form.width = 1200
                form.height = 800
                form.resolution = 0.05
                form.origin_x = 0
                form.origin_y = 0
                form.isPrimary = false
                form.isActive = true
                form.description = ''
            }
        }
    },
)

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            form.originX = form.origin_x
            form.originY = form.origin_y
            await saveMap(form)
            ElMessage.success(props.isEdit ? '지도 정보가 수정되었습니다.' : '신규 지도가 등록되었습니다.')
            emit('update:modelValue', false)
            emit('saved')
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}
</script>
