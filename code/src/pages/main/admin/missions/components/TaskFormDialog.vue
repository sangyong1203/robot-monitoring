<template>
    <BaseDialog
        :model-value="visible"
        :title="editingItem ? 'Task 정보 수정' : '신규 Task 등록'"
        width="650px"
        @update:model-value="emit('update:visible', $event)"
    >
        <el-form label-position="top">
            <el-form-item label="Task 코드" required>
                <el-input v-model="form.code" placeholder="예: TASK-FORKLIFT-01" />
            </el-form-item>
            <el-form-item label="Task 이름" required>
                <el-input v-model="form.name" placeholder="예: 무인지게차 팰릿 적재 및 수송 Task" />
            </el-form-item>
            <el-form-item label="대상 로봇 모델" required>
                <el-select v-model="form.robotModelName" style="width:100%">
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

            <!-- Activity 동적 순서 조합 -->
            <el-form-item label="포함 Activity 순서 조합">
                <div v-for="(actItem, aIdx) in form.selectedActivities" :key="aIdx" class="builder-row">
                    <span class="seq-num">{{ aIdx + 1 }}.</span>
                    <el-select v-model="actItem.activityId" style="flex:1" placeholder="Activity 선택">
                        <el-option
                            v-for="act in activities"
                            :key="act.id"
                            :label="`[${act.code}] ${act.name}`"
                            :value="act.id"
                        />
                    </el-select>
                    <button type="button" class="builder-delete-btn" title="삭제" @click="removeActivity(aIdx)">
                        <el-icon><Trash2 /></el-icon>
                    </button>
                </div>
                <el-button type="primary" plain size="small" style="margin-top: 8px" @click="addActivity">+ Activity 추가</el-button>
            </el-form-item>

            <el-form-item label="Task 설명">
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
import { Trash2 } from '@lucide/vue'
import { ElMessage } from 'element-plus'
import type { TaskItem, ActivityItem } from '../service/missionManagement.types'
import type { DestinationItem } from '../../destinations/service/destinations.types'

const props = defineProps<{
    visible: boolean
    editingItem?: TaskItem | null
    activities: ActivityItem[]
    destinations: DestinationItem[]
    nextCodeNumber: number
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    save: [data: {
        id?: number
        code: string
        name: string
        robotModelName: string
        destinationId?: number
        description: string
        selectedActivities: { activityId: number }[]
    }]
}>()

const form = ref({
    code: '',
    name: '',
    robotModelName: '무인지게차',
    destinationId: undefined as number | undefined,
    selectedActivities: [] as { activityId: number }[],
    description: '',
})

watch(() => props.visible, (val) => {
    if (val) {
        if (props.editingItem) {
            form.value = {
                code: props.editingItem.code,
                name: props.editingItem.name,
                robotModelName: props.editingItem.robotModelName,
                destinationId: props.editingItem.destinationId,
                selectedActivities: props.editingItem.activities.map(a => ({ activityId: a.activityId })),
                description: props.editingItem.description || '',
            }
        } else {
            form.value = {
                code: `TASK-AUTO-0${props.nextCodeNumber}`,
                name: '',
                robotModelName: '무인지게차',
                destinationId: undefined,
                selectedActivities: props.activities.slice(0, 1).map(a => ({ activityId: a.id })),
                description: '',
            }
        }
    }
})

const addActivity = () => {
    form.value.selectedActivities.push({
        activityId: props.activities[0]?.id ?? 1,
    })
}

const removeActivity = (idx: number) => {
    form.value.selectedActivities.splice(idx, 1)
}

const handleSave = () => {
    if (!form.value.name.trim() || !form.value.code.trim()) {
        ElMessage.warning('Task 코드와 이름을 입력하세요.')
        return
    }
    emit('save', {
        id: props.editingItem?.id,
        ...form.value,
    })
}
</script>

<style scoped lang="scss">
.builder-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    width: 100%;

    .seq-num {
        font-weight: 700;
        color: var(--primary-color);
        width: 20px;
    }
}

.builder-delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    color: #ff7878;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;

    &:hover {
        background: rgba(255, 107, 107, 0.18);
        color: #ff4d4d;
    }
}
</style>
