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
                label="로봇 종류"
                placeholder="로봇 종류 선택"
                :list="robotTypeOptions"
                optionLabel="label"
                optionValue="value"
                width="220px"
                @onChange="handleSearch"
            />
        </SearchBox>

        <!-- 메인 데이터 패널 -->
        <Panel class="management-page__panel" title="로봇 모델 목록" :total="models.length" fill>
            <template #headerRight>
                <el-button type="primary" @click="openCreateDialog"> 신규 로봇 모델 등록 </el-button>
            </template>

            <el-table
                v-loading="loading"
                :data="models"
                row-key="id"
                height="100%"
                class="management-page__table"
                @row-dblclick="openEditDialog"
            >
                <el-table-column label="로봇 모델명" min-width="260">
                    <template #default="{ row }">
                        <TableRowTooltip :content="row.modelName" />
                    </template>
                </el-table-column>

                <el-table-column label="모델 코드" width="160" align="center">
                    <template #default="{ row }">
                        <TableRowTooltip :content="row.modelCode" />
                    </template>
                </el-table-column>

                <el-table-column prop="robotType" label="로봇 종류" width="140" align="center">
                    <template #default="{ row }">
                        <StatusBadge :label="typeLabel(row.robotType)" :variant="typeVariant(row.robotType)" />
                    </template>
                </el-table-column>

                <el-table-column label="제조사" width="150" align="center">
                    <template #default="{ row }">
                        <TableRowTooltip :content="row.manufacturer" />
                    </template>
                </el-table-column>

                <el-table-column label="OS / 플랫폼" width="180" align="center">
                    <template #default="{ row }">
                        <TableRowTooltip :content="row.os" />
                    </template>
                </el-table-column>

                <el-table-column prop="registeredRobotCount" label="배치 운영 로봇 수" width="140" align="center" />

                <el-table-column label="모니터링 & 제어 지원" min-width="240">
                    <template #default="{ row }">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap">
                            <StatusBadge
                                :label="
                                    row.monitoringOptions.supportDestinationControl ? '목적지제어' : '목적지제어불가'
                                "
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
                        <StatusBadge
                            :label="row.isActive ? '사용' : '미사용'"
                            :variant="row.isActive ? 'success' : 'danger'"
                        />
                    </template>
                </el-table-column>

                <el-table-column label="작업" width="90" align="center" fixed="right">
                    <template #default="{ row }">
                        <TableActions>
                            <el-button type="primary" text title="상세 및 수정" @click="openEditDialog(row)">
                                <el-icon><Pencil /></el-icon>
                            </el-button>
                        </TableActions>
                    </template>
                </el-table-column>
            </el-table>
        </Panel>

        <!-- 신규/수정 분리형 다이얼로그 컴포넌트 -->
        <RobotModelFormDialog
            v-model="dialogVisible"
            :is-edit="dialogIsEdit"
            :initial-data="selectedModel"
            @saved="handleSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Bot, Pencil } from '@lucide/vue'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import DropdownList from '@/components/DropdownList.vue'
import TableActions from '@/components/TableActions.vue'
import TableRowTooltip from '@/components/TableRowTooltip.vue'
import RobotModelFormDialog from './components/RobotModelFormDialog.vue'
import { getRobotModels } from './service/robotModels.api'
import type { RobotModelItem } from './service/robotModels.types'
import type { RobotType } from '@/types/enums'

const loading = ref(false)
const models = ref<RobotModelItem[]>([])

const query = reactive<{ keyword: string; robotType?: RobotType }>({
    keyword: '',
    robotType: undefined,
})

const robotTypeOptions = [
    { label: '전체 로봇 종류', value: undefined },
    { label: '무인지게차 (1대)', value: 'FORKLIFT' },
    { label: '저상형 AMR (2대)', value: 'AMR' },
    { label: '산업용 로봇 (1대)', value: 'INDUSTRIAL_ARM' },
    { label: '편심 자율주행 (1대)', value: 'ECCENTRIC_ROBOT' },
    { label: '4족 보행 로봇 (1대)', value: 'QUADRUPED_ROBOT' },
    { label: '실외 자율주행 (1대)', value: 'OUTDOOR_ROBOT' },
]

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const selectedModel = ref<RobotModelItem | null>(null)

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
    selectedModel.value = null
    dialogVisible.value = true
}

const openEditDialog = (row: RobotModelItem) => {
    dialogIsEdit.value = true
    selectedModel.value = row
    dialogVisible.value = true
}

onMounted(() => {
    handleSearch()
})
</script>

<style scoped lang="scss"></style>
