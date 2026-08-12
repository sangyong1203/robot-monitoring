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
                    <el-option label="사용자 지정 Cron 표현식 (CUSTOM)" value="CUSTOM" />
                </el-select>
            </el-form-item>

            <!-- 1. DAILY 옵션 -->
            <el-form-item v-if="form.scheduleType === 'DAILY'" label="매일 실행 시간 설정" required>
                <el-time-picker
                    v-model="dailyTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="매일 실행 시간 선택"
                    style="width: 100%"
                />
            </el-form-item>

            <!-- 2. HOURLY 옵션 -->
            <el-form-item v-if="form.scheduleType === 'HOURLY'" label="실행 시간 간격 설정" required>
                <div class="hourly-picker-row">
                    <el-input-number v-model="hourlyInterval" :min="1" :max="24" style="width: 160px" />
                    <span class="unit-txt">시간 간격마다 자동 실행</span>
                </div>
            </el-form-item>

            <!-- 3. WEEKLY 옵션 -->
            <el-form-item v-if="form.scheduleType === 'WEEKLY'" label="주간 실행 요일 및 시간 설정" required>
                <div class="weekly-picker-box">
                    <DaysCheckboxGroup v-model="weeklyDays" />
                    <el-time-picker
                        v-model="weeklyTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="실행 시간 선택"
                        style="width: 100%; margin-top: 8px"
                    />
                </div>
            </el-form-item>

            <!-- 4. CUSTOM 옵션 -->
            <el-form-item v-if="form.scheduleType === 'CUSTOM'" label="Cron 표현식 직접 입력" required>
                <el-input v-model="customCron" placeholder="예: 0 0 9 * * ?" />
                <div class="preset-badges">
                    <span class="preset-label">자주 쓰는 프리셋:</span>
                    <button type="button" class="preset-btn" @click="applyPreset('매일 09:00')">매일 09:00</button>
                    <button type="button" class="preset-btn" @click="applyPreset('2시간 간격')">2시간 간격</button>
                    <button type="button" class="preset-btn" @click="applyPreset('매주 월,수 09:00')">매주 월,수 09:00</button>
                </div>
            </el-form-item>

            <!-- 최종 시간 표현식 요약 프리뷰 -->
            <div class="schedule-summary-box">
                <span class="summary-icon">⏱️</span>
                <span class="summary-label">실행 표현식 요약:</span>
                <span class="summary-value">{{ computedCronExpression }}</span>
            </div>
        </el-form>

        <template #footer>
            <el-button @click="emit('update:visible', false)">취소</el-button>
            <el-button type="primary" @click="handleSave">저장</el-button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseDialog from '@/components/BaseDialog.vue'
import DaysCheckboxGroup from '@/components/DaysCheckboxGroup.vue'
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
        scheduleType: 'DAILY' | 'HOURLY' | 'WEEKLY' | 'CUSTOM'
        cronExpression: string
    }]
}>()

const dayOptions = ['월', '화', '수', '목', '금', '토', '일']

const form = ref({
    name: '',
    missionId: 1,
    scheduleType: 'DAILY' as 'DAILY' | 'HOURLY' | 'WEEKLY' | 'CUSTOM',
})

const dailyTime = ref('09:00')
const hourlyInterval = ref(2)
const weeklyDays = ref(['월', '수', '금'])
const weeklyTime = ref('09:00')
const customCron = ref('매일 09:00')

const computedCronExpression = computed(() => {
    switch (form.value.scheduleType) {
        case 'DAILY':
            return `매일 ${dailyTime.value || '09:00'}`
        case 'HOURLY':
            return `${hourlyInterval.value || 1}시간 간격`
        case 'WEEKLY':
            return `매주 ${weeklyDays.value.length ? weeklyDays.value.join(',') : '월'} ${weeklyTime.value || '09:00'}`
        case 'CUSTOM':
            return customCron.value || '매일 09:00'
        default:
            return '매일 09:00'
    }
})

watch(() => props.visible, (val) => {
    if (val) {
        if (props.editingItem) {
            form.value = {
                name: props.editingItem.name,
                missionId: props.editingItem.missionId,
                scheduleType: props.editingItem.scheduleType,
            }
            customCron.value = props.editingItem.cronExpression || '매일 09:00'
        } else {
            form.value = {
                name: '',
                missionId: props.missions[0]?.id ?? 1,
                scheduleType: 'DAILY',
            }
            dailyTime.value = '09:00'
            hourlyInterval.value = 2
            weeklyDays.value = ['월', '수', '금']
            weeklyTime.value = '09:00'
            customCron.value = '매일 09:00'
        }
    }
})

const applyPreset = (presetText: string) => {
    customCron.value = presetText
}

const handleSave = () => {
    if (!form.value.name.trim()) {
        ElMessage.warning('스케줄 명칭을 입력하세요.')
        return
    }
    emit('save', {
        id: props.editingItem?.id,
        name: form.value.name,
        missionId: form.value.missionId,
        scheduleType: form.value.scheduleType,
        cronExpression: computedCronExpression.value,
    })
}
</script>

<style scoped lang="scss">
.hourly-picker-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .unit-txt {
        font-size: 14px;
        color: var(--text-color--secondary);
    }
}

.weekly-picker-box {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.preset-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;

    .preset-label {
        font-size: 12px;
        color: var(--secondary-color);
    }

    .preset-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass-color);
        color: var(--primary-color);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.18s ease;

        &:hover {
            background: rgba(231, 109, 255, 0.2);
        }
    }
}

.schedule-summary-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-glass-color);
    padding: 10px 14px;
    border-radius: 8px;
    margin-top: 16px;

    .summary-icon {
        font-size: 16px;
    }

    .summary-label {
        font-size: 13px;
        color: var(--secondary-color);
        font-weight: 500;
    }

    .summary-value {
        font-size: 14px;
        font-weight: 700;
        color: var(--primary-color);
    }
}
</style>
