<template>
    <div class="management-page">
        <!-- 상단 검색 패널 -->
        <SearchBox :onSearch="handleSearch" :loading="loading">
            <SearchText
                v-model="query.keyword"
                placeholder="로봇 이름, 로봇 ID, 모델명 검색"
                width="320px"
                @onEnter="handleSearch"
                @clear="handleSearch"
            />
            <DropdownList
                v-model="query.isOperating"
                label="운영 상태"
                :list="statusOptions"
                optionLabel="label"
                optionValue="value"
                width="180px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 메인 데이터 패널 -->
        <Panel class="management-page__panel" title="배치 운영 로봇 목록 (6종 7대)" :total="robots.length" fill>
            <template #headerRight>
                <el-button type="primary" class="query-button" @click="openCreateDialog">
                    <el-icon><Bot /></el-icon>
                    신규 운영 로봇 등록
                </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="robots"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column prop="name" label="운영 로봇 명칭 및 식별 ID" min-width="220">
                    <template #default="{ row }">
                        <strong style="color: var(--text-color--primary); font-size: 15px">{{ row.name }}</strong>
                        <div style="font-size: 12px; color: var(--text-color--body)">ID: {{ row.robotCode }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="modelName" label="연계 로봇 모델" min-width="240">
                    <template #default="{ row }">
                        <div style="color: var(--text-color--primary); font-weight: 600">{{ row.modelName }}</div>
                        <div style="font-size: 12px; color: var(--text-color--body)">제조사: {{ row.manufacturer }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="orgPath" label="설치 기관 및 구역" min-width="220">
                    <template #default="{ row }">
                        <div style="font-size: 13px; color: var(--text-color--primary)">{{ row.orgPath }}</div>
                        <div style="font-size: 12px; color: var(--text-color--body)">지도: {{ row.mapName }}</div>
                    </template>
                </el-table-column>

                <el-table-column label="실시간 상태 / 배터리" width="180" align="center">
                    <template #default="{ row }">
                        <div style="display: flex; gap: 4px; justify-content: center; align-items: center">
                            <StatusBadge
                                :label="row.communicationStatus === 'ONLINE' ? '정상' : row.communicationStatus === 'STALE' ? '지연' : '오프라인'"
                                :variant="row.communicationStatus === 'ONLINE' ? 'success' : row.communicationStatus === 'STALE' ? 'warning' : 'danger'"
                            />
                            <StatusBadge :label="`${row.batteryPercent}%`" :variant="row.batteryPercent > 20 ? 'info' : 'danger'" />
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="현재 2D 위치" width="150" align="center">
                    <template #default="{ row }">
                        <div style="color: var(--text-color--primary)">X: {{ row.x }}m · Y: {{ row.y }}m</div>
                        <div style="font-size: 11px; color: var(--secondary-color)">방향: {{ row.heading }}°</div>
                    </template>
                </el-table-column>

                <el-table-column prop="isOperating" label="운영 상태" width="100" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="row.isOperating ? '운영 중' : '미운영'" :variant="row.isOperating ? 'success' : 'danger'" />
                    </template>
                </el-table-column>

                <el-table-column label="작업" width="160" align="center" fixed="right">
                    <template #default="{ row }">
                        <div class="table-actions">
                            <el-button
                                class="table-actions__icon-button"
                                type="success"
                                text
                                title="관제 모니터링"
                                :disabled="!row.isOperating"
                                @click="goMonitoring(row)"
                            >
                                <el-icon><Tv /></el-icon>
                            </el-button>
                            <el-button
                                class="table-actions__icon-button"
                                type="primary"
                                text
                                title="수정"
                                @click="openEditDialog(row)"
                            >
                                <el-icon><Pencil /></el-icon>
                            </el-button>
                            <el-button
                                class="table-actions__icon-button"
                                type="danger"
                                text
                                title="삭제"
                                @click="confirmDelete(row)"
                            >
                                <el-icon><Trash2 /></el-icon>
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </Panel>

        <!-- 신규/수정 다이얼로그 -->
        <BaseDialog
            v-model="dialogVisible"
            :title="dialogIsEdit ? '운영 로봇 정보 수정' : '신규 운영 로봇 등록'"
            description="현장에 실제 설치/배치되는 로봇 정보 및 모델 연동을 설정합니다."
            width="640px"
            :buttonTypes="['Cancel', 'Save']"
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
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bot, Pencil, Trash2, Tv } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import { deleteOperatingRobot, getOperatingRobots, saveOperatingRobot } from './service/operatingRobots.api'
import type { OperatingRobotItem, SaveOperatingRobotPayload } from './service/operatingRobots.types'

const router = useRouter()
const loading = ref(false)
const robots = ref<OperatingRobotItem[]>([])

const query = reactive<{ keyword: string; isOperating?: boolean }>({
    keyword: '',
    isOperating: undefined,
})

const statusOptions = [
    { label: '전체 상태', value: undefined },
    { label: '운영 중', value: true },
    { label: '미운영', value: false },
]

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

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const formRef = ref()

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

const handleSearch = async () => {
    loading.value = true
    try {
        robots.value = await getOperatingRobots(query)
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    dialogIsEdit.value = false
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
    dialogVisible.value = true
}

const openEditDialog = (row: OperatingRobotItem) => {
    dialogIsEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveOperatingRobot(form)
            ElMessage.success(dialogIsEdit.value ? '운영 로봇 정보가 수정되었습니다.' : '신규 운영 로봇이 등록되었습니다.')
            dialogVisible.value = false
            await handleSearch()
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}

const confirmDelete = async (row: OperatingRobotItem) => {
    try {
        await ElMessageBox.confirm(
            `운영 로봇 '${row.name} (${row.robotCode})'을(를) 시스템에서 삭제하시겠습니까? 관련 이력이 함께 정리됩니다.`,
            '운영 로봇 삭제 확인',
            {
                confirmButtonText: '삭제',
                cancelButtonText: '취소',
                type: 'warning',
            },
        )
        await deleteOperatingRobot(row.id)
        ElMessage.success('운영 로봇이 삭제되었습니다.')
        await handleSearch()
    } catch {
        // Canceled
    }
}

const goMonitoring = (row: OperatingRobotItem) => {
    router.push({ path: '/main/integrated-monitoring', query: { robotId: row.id } })
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
