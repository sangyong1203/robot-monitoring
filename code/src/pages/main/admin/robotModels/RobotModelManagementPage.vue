<template>
    <div class="management-page">
        <!-- 상단 조회 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="모델명, 모델 코드, 제조사 검색"
                width="320px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="query.robotType"
                label="로봇 종"
                :list="robotTypeOptions"
                optionLabel="label"
                optionValue="value"
                width="220px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 메인 데이터 패널 -->
        <Panel class="management-page__panel" title="운영 원형 로봇 모델 목록" :total="models.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    <el-icon><Bot /></el-icon>
                    신규 로봇 모델 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="models"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column prop="modelName" label="로봇 모델명" min-width="260" show-overflow-tooltip />

                <el-table-column prop="modelCode" label="모델 코드" width="160" align="center" />

                <el-table-column prop="robotType" label="로봇 종" width="140" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="typeLabel(row.robotType)" :variant="typeVariant(row.robotType)" />
                    </template>
                </el-table-column>

                <el-table-column prop="manufacturer" label="제조사" width="150" align="center" show-overflow-tooltip />

                <el-table-column prop="os" label="OS / 플랫폼" width="180" align="center" />

                <el-table-column prop="registeredRobotCount" label="배치 운영 로봇 수" width="140" align="center" />

                <el-table-column label="모니터링 & 제어 지원" min-width="240">
                    <template #default="{ row }">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap">
                            <StatusBadge
                                :label="row.monitoringOptions.supportDestinationControl ? '목적지제어' : '목적지제어불가'"
                                :variant="row.monitoringOptions.supportDestinationControl ? 'success' : 'muted'"
                            />
                            <StatusBadge
                                :label="row.monitoringOptions.supportManualControl ? '수동주행' : '수동주행불가'"
                                :variant="row.monitoringOptions.supportManualControl ? 'progress' : 'muted'"
                            />
                            <StatusBadge
                                :label="`카메라 ${row.monitoringOptions.cameraChannels.length}채널`"
                                variant="info"
                            />
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="isActive" label="사용 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isActive ? '사용' : '미사용'" :variant="row.isActive ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="작업" width="90" align="center" fixed="right">
                    <template #default="{ row }">
                        <div class="table-actions">
                            <el-button
                                class="table-actions__icon-button"
                                type="primary"
                                text
                                title="상세 및 수정"
                                @click="openEditDialog(row)"
                            >
                                <el-icon><Pencil /></el-icon>
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </Panel>

        <!-- 신규/수정 다이얼로그 -->
        <BaseDialog
            v-model="dialogVisible"
            :title="dialogIsEdit ? '로봇 모델 사양 및 모니터링 항목 수정' : '신규 로봇 모델 등록'"
            description="로봇 제조사, OS, 제어 기능 및 카메라/센서 모니터링 그룹을 설정합니다."
            width="720px"
            :buttonTypes="['Cancel', 'Save']"
            @onSave="handleSave"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
                <el-form-item label="로봇 모델명" prop="modelName">
                    <el-input v-model="form.modelName" placeholder="예: KORAD 실내 중량물 무인지게차 (1.5t)" />
                </el-form-item>

                <el-form-item label="모델 식별 코드" prop="modelCode">
                    <el-input v-model="form.modelCode" placeholder="예: MODEL-FORKLIFT-01" />
                </el-form-item>

                <el-form-item label="로봇 종 분류" prop="robotType">
                    <el-select v-model="form.robotType" style="width: 100%">
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
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Bot, Pencil } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import { getRobotModels, saveRobotModel } from './service/robotModels.api'
import type { RobotModelItem, SaveRobotModelPayload } from './service/robotModels.types'
import type { RobotType } from '@/types/enums'

const loading = ref(false)
const models = ref<RobotModelItem[]>([])

const query = reactive<{ keyword: string; robotType?: RobotType }>({
    keyword: '',
    robotType: undefined,
})

const robotTypeOptions = [
    { label: '전체 로봇 종', value: undefined },
    { label: '무인지게차 (1대)', value: 'FORKLIFT' },
    { label: '저상형 AMR (2대)', value: 'AMR' },
    { label: '산업용 로봇 (1대)', value: 'INDUSTRIAL_ARM' },
    { label: '편심 자율주행 (1대)', value: 'ECCENTRIC_ROBOT' },
    { label: '4족 보행 로봇 (1대)', value: 'QUADRUPED_ROBOT' },
    { label: '실외 자율주행 (1대)', value: 'OUTDOOR_ROBOT' },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
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

const typeLabel = (type: RobotType) => {
    switch (type) {
        case 'FORKLIFT':
            return '무인지게차'
        case 'AMR':
            return '저상형 AMR'
        case 'INDUSTRIAL_ARM':
            return '산업용 로봇'
        case 'ECCENTRIC_ROBOT':
            return '편심 자율주행'
        case 'QUADRUPED_ROBOT':
            return '4족 보행'
        case 'OUTDOOR_ROBOT':
            return '실외 자율주행'
        default:
            return type
    }
}

const typeVariant = (type: RobotType) => {
    switch (type) {
        case 'FORKLIFT':
            return 'progress'
        case 'AMR':
            return 'info'
        case 'INDUSTRIAL_ARM':
            return 'success'
        case 'ECCENTRIC_ROBOT':
        case 'QUADRUPED_ROBOT':
            return 'warning'
        default:
            return 'muted'
    }
}

const handleSearch = async () => {
    loading.value = true
    try {
        models.value = await getRobotModels(query)
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    dialogIsEdit.value = false
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
    dialogVisible.value = true
}

const openEditDialog = (row: RobotModelItem) => {
    dialogIsEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveRobotModel(form)
            ElMessage.success(dialogIsEdit.value ? '로봇 모델 정보가 수정되었습니다.' : '신규 로봇 모델이 등록되었습니다.')
            dialogVisible.value = false
            await handleSearch()
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}

onMounted(() => {
    handleSearch()
})
</script>

<style scoped lang="scss">
.query-button {
    height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    white-space: nowrap;
}

.icon-svg {
    width: 18px;
    height: 18px;
}

.icon-action {
    width: 16px;
    height: 16px;
}
</style>
