<template>
    <BaseDialog
        :model-value="visible"
        :title="editingItem ? 'Activity 정보 수정' : '신규 Activity 등록'"
        width="600px"
        @update:model-value="emit('update:visible', $event)"
    >
        <el-form label-position="top">
            <el-form-item label="Activity 코드" required>
                <el-input v-model="form.code" placeholder="예: ACT-MOVE-01" />
            </el-form-item>
            <el-form-item label="Activity 이름" required>
                <el-input v-model="form.name" placeholder="예: 처분용기 전면 주행" />
            </el-form-item>
            <el-form-item label="동작 유형 (Type)" required>
                <el-select v-model="form.activityType" style="width:100%">
                    <el-option label="이동 (MOVE)" value="MOVE" />
                    <el-option label="상차/집게 (PICK)" value="PICK" />
                    <el-option label="하차/장입 (PLACE)" value="PLACE" />
                    <el-option label="검사/순찰 (INSPECT)" value="INSPECT" />
                    <el-option label="대기 (WAIT)" value="WAIT" />
                    <el-option label="충전 (CHARGE)" value="CHARGE" />
                </el-select>
            </el-form-item>
            <el-form-item label="대상 로봇 모델">
                <el-select v-model="form.targetRobotModelName" style="width:100%" clearable placeholder="전역/전체 로봇 적용">
                    <el-option label="무인지게차 (AGV Forklift)" value="무인지게차" />
                    <el-option label="저상형 AMR" value="저상형 AMR" />
                    <el-option label="산업용 로봇" value="산업용 로봇" />
                    <el-option label="4족 보행 로봇 (Spot)" value="4족 보행 로봇" />
                </el-select>
            </el-form-item>
            <el-form-item label="목적지 (POI) 연동">
                <el-select v-model="form.destinationId" style="width:100%" clearable placeholder="목적지 선택">
                    <el-option
                        v-for="dest in destinations"
                        :key="dest.id"
                        :label="`[${dest.type}] ${dest.name}`"
                        :value="dest.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="설명">
                <el-input v-model="form.description" type="textarea" :rows="2" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="emit('update:visible', false)">취소</el-button>
            <el-button type="primary" @click="handleSave">저장</el-button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDialog from '@/components/BaseDialog.vue'
import { ElMessage } from 'element-plus'
import type { ActivityItem, ActivityType } from '../service/missionManagement.types'
import type { DestinationItem } from '../../destinations/service/destinations.types'

const props = defineProps<{
    visible: boolean
    editingItem?: ActivityItem | null
    destinations: DestinationItem[]
    nextCodeNumber: number
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    save: [data: {
        id?: number
        code: string
        name: string
        activityType: ActivityType
        targetRobotModelName?: string
        destinationId?: number
        description: string
    }]
}>()

const form = ref({
    code: '',
    name: '',
    activityType: 'MOVE' as ActivityType,
    targetRobotModelName: undefined as string | undefined,
    destinationId: undefined as number | undefined,
    description: '',
})

watch(() => props.visible, (val) => {
    if (val) {
        if (props.editingItem) {
            form.value = {
                code: props.editingItem.code,
                name: props.editingItem.name,
                activityType: props.editingItem.activityType,
                targetRobotModelName: props.editingItem.targetRobotModelName,
                destinationId: props.editingItem.destinationId,
                description: props.editingItem.description || '',
            }
        } else {
            form.value = {
                code: `ACT-AUTO-0${props.nextCodeNumber}`,
                name: '',
                activityType: 'MOVE',
                targetRobotModelName: undefined,
                destinationId: undefined,
                description: '',
            }
        }
    }
})

const handleSave = () => {
    if (!form.value.name.trim() || !form.value.code.trim()) {
        ElMessage.warning('Activity 코드와 이름을 입력하세요.')
        return
    }
    emit('save', {
        id: props.editingItem?.id,
        ...form.value,
    })
}
</script>
