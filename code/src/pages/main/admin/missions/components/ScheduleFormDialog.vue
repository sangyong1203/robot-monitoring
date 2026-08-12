<template>
    <BaseDialog
        :model-value="visible"
        :title="editingItem ? '자동 실행 스케줄 수정' : '신규 자동 실행 스케줄 등록'"
        width="620px"
        @update:model-value="emit('update:visible', $event)"
    >
        <el-form label-position="top">
            <el-form-item label="스케줄 명칭" required>
                <el-input v-model="form.name" placeholder="예: 정기 오전 방사성 폐기물 자동 수송" />
            </el-form-item>
            <el-form-item label="실행 대상 미션" required>
                <el-select v-model="form.missionId" style="width:100%">
                    <el-option
                        v-for="mis in missions"
                        :key="mis.id"
                        :label="`[${mis.code}] ${mis.name}`"
                        :value="mis.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="주기 유형" required>
                <el-select v-model="form.scheduleType" style="width:100%">
                    <el-option label="매일 정시 실행 (DAILY)" value="DAILY" />
                    <el-option label="시간 간격 실행 (HOURLY)" value="HOURLY" />
                    <el-option label="주간 지정 실행 (WEEKLY)" value="WEEKLY" />
                </el-select>
            </el-form-item>
            <el-form-item label="Cron / 실행 시간 표현식" required>
                <el-input v-model="form.cronExpression" placeholder="예: 매일 09:00 또는 0 0 9 * * ?" />
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
import type { ScheduleItem, MissionItem } from '../service/missionManagement.types'

const props = defineProps<{
    visible: boolean
    editingItem?: ScheduleItem | null
    missions: MissionItem[]
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    save: [data: {
        id?: number
        name: string
        missionId: number
        scheduleType: 'DAILY' | 'HOURLY' | 'WEEKLY'
        cronExpression: string
    }]
}>()

const form = ref({
    name: '',
    missionId: 1,
    scheduleType: 'DAILY' as 'DAILY' | 'HOURLY' | 'WEEKLY',
    cronExpression: '매일 09:00',
})

watch(() => props.visible, (val) => {
    if (val) {
        if (props.editingItem) {
            form.value = {
                name: props.editingItem.name,
                missionId: props.editingItem.missionId,
                scheduleType: props.editingItem.scheduleType === 'CUSTOM' ? 'DAILY' : props.editingItem.scheduleType,
                cronExpression: props.editingItem.cronExpression,
            }
        } else {
            form.value = {
                name: '',
                missionId: props.missions[0]?.id ?? 1,
                scheduleType: 'DAILY',
                cronExpression: '매일 09:00',
            }
        }
    }
})

const handleSave = () => {
    if (!form.value.name.trim()) {
        ElMessage.warning('스케줄 명칭을 입력하세요.')
        return
    }
    emit('save', {
        id: props.editingItem?.id,
        ...form.value,
    })
}
</script>
