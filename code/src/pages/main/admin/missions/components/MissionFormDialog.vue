<template>
    <BaseDialog
        :model-value="visible"
        :title="editingItem ? 'Mission 수정' : '신규 Mission 등록'"
        width="680px"
        @update:model-value="emit('update:visible', $event)"
    >
        <el-form label-position="top">
            <el-form-item label="미션 코드" required>
                <el-input v-model="form.code" placeholder="예: MIS-FUSED-01" />
            </el-form-item>
            <el-form-item label="미션 이름" required>
                <el-input v-model="form.name" placeholder="예: [융합] 폐기물 이송 및 장입 미션" />
            </el-form-item>
            <el-form-item label="미션 유형" required>
                <el-radio-group v-model="form.missionType" class="mission-type-radio-group">
                    <el-radio-button value="CONVERGENCE">융합 미션</el-radio-button>
                    <el-radio-button value="SINGLE">단일 로봇 미션</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <!-- 포함 Task 순서 구성 -->
            <el-form-item label="포함 Task 및 로봇 배정 조합">
                <div v-for="(tItem, tIdx) in form.selectedTasks" :key="tIdx" class="builder-row">
                    <span class="seq-num">{{ tIdx + 1 }}.</span>
                    <el-select v-model="tItem.taskId" style="flex:1" placeholder="Task 선택">
                        <el-option
                            v-for="tk in tasks"
                            :key="tk.id"
                            :label="`[${tk.code}] ${tk.name}`"
                            :value="tk.id"
                        />
                    </el-select>
                    <el-input v-model="tItem.robotName" placeholder="배정 로봇명 (예: 무인지게차 1호기)" style="flex:1" />
                    <button type="button" class="builder-delete-btn" title="삭제" @click="removeTask(tIdx)">
                        <el-icon><Trash2 /></el-icon>
                    </button>
                </div>
                <el-button type="primary" plain size="small" style="margin-top: 8px" @click="addTask">+ Task 추가</el-button>
            </el-form-item>

            <!-- 선행 조건 설정 (미션 시나리오) -->
            <el-form-item label="Task 간 선행 조건 (미션 트리거 시나리오)">
                <div v-for="(cItem, cIdx) in form.selectedConditions" :key="cIdx" class="builder-row">
                    <el-select v-model="cItem.precedingTaskId" placeholder="선행 Task" style="flex:1">
                        <el-option v-for="tk in tasks" :key="tk.id" :label="tk.name" :value="tk.id" />
                    </el-select>
                    <span class="cond-txt">완료 시 ➔</span>
                    <el-select v-model="cItem.triggerTaskId" placeholder="후속 Task 실행" style="flex:1">
                        <el-option v-for="tk in tasks" :key="tk.id" :label="tk.name" :value="tk.id" />
                    </el-select>
                    <button type="button" class="builder-delete-btn" title="삭제" @click="removeCondition(cIdx)">
                        <el-icon><Trash2 /></el-icon>
                    </button>
                </div>
                <el-button type="primary" plain size="small" style="margin-top: 8px" @click="addCondition">+ 선행 조건 추가</el-button>
            </el-form-item>

            <el-form-item label="미션 설명">
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
import type { MissionItem, TaskItem } from '../service/missionManagement.types'

const props = defineProps<{
    visible: boolean
    editingItem?: MissionItem | null
    tasks: TaskItem[]
    nextCodeNumber: number
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    save: [data: {
        id?: number
        code: string
        name: string
        missionType: 'SINGLE' | 'CONVERGENCE'
        description: string
        selectedTasks: { taskId: number; robotName: string }[]
        selectedConditions: { precedingTaskId: number; triggerTaskId: number }[]
    }]
}>()

const form = ref({
    code: '',
    name: '',
    missionType: 'CONVERGENCE' as 'SINGLE' | 'CONVERGENCE',
    description: '',
    selectedTasks: [] as { taskId: number; robotName: string }[],
    selectedConditions: [] as { precedingTaskId: number; triggerTaskId: number }[],
})

watch(() => props.visible, (val) => {
    if (val) {
        if (props.editingItem) {
            form.value = {
                code: props.editingItem.code,
                name: props.editingItem.name,
                missionType: props.editingItem.missionType,
                description: props.editingItem.description || '',
                selectedTasks: props.editingItem.tasks.map(t => ({ taskId: t.taskId, robotName: t.robotName })),
                selectedConditions: props.editingItem.conditions.map(c => ({ precedingTaskId: c.precedingTaskId, triggerTaskId: c.triggerTaskId })),
            }
        } else {
            form.value = {
                code: `MIS-CONV-0${props.nextCodeNumber}`,
                name: '',
                missionType: 'CONVERGENCE',
                description: '',
                selectedTasks: props.tasks.slice(0, 2).map(t => ({ taskId: t.id, robotName: '통합 지정 로봇' })),
                selectedConditions: [],
            }
        }
    }
})

const addTask = () => {
    form.value.selectedTasks.push({
        taskId: props.tasks[0]?.id ?? 1,
        robotName: '지정 로봇 1호기',
    })
}

const removeTask = (idx: number) => {
    form.value.selectedTasks.splice(idx, 1)
}

const addCondition = () => {
    form.value.selectedConditions.push({
        precedingTaskId: props.tasks[0]?.id ?? 1,
        triggerTaskId: props.tasks[1]?.id ?? 2,
    })
}

const removeCondition = (idx: number) => {
    form.value.selectedConditions.splice(idx, 1)
}

const handleSave = () => {
    if (!form.value.name.trim() || !form.value.code.trim()) {
        ElMessage.warning('미션 코드와 이름을 입력하세요.')
        return
    }
    emit('save', {
        id: props.editingItem?.id,
        ...form.value,
    })
}
</script>

<style scoped lang="scss">
.mission-type-radio-group {
    display: flex;
    width: 100%;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 3px;

    :deep(.el-radio-button) {
        flex: 1;
        display: flex;

        .el-radio-button__inner {
            width: 100%;
            background: transparent;
            border: 1px solid transparent !important;
            border-radius: 6px;
            color: var(--text-color--secondary);
            box-shadow: none !important;
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
            padding: 8px 16px;
            font-weight: 500;
        }

        &.is-active .el-radio-button__inner {
            background: var(--primary-color-1);
            color: var(--primary-color);
            border-color: var(--border-glass-color) !important;
            font-weight: 700;
        }
    }
}

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

    .cond-txt {
        font-size: 12px;
        color: var(--secondary-color);
        white-space: nowrap;
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
