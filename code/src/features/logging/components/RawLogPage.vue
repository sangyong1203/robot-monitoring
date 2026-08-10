<template>
    <section class="raw-log-page" :aria-label="title">
        <div v-if="!canRead" class="raw-log-page__state">
            <ShieldAlert :size="34" />
            <strong>로그 조회 권한이 없습니다.</strong>
            <p>관리자에게 {{ screenId }} READ 권한을 요청해 주세요.</p>
        </div>

        <template v-else>
            <SearchBox :loading="isLoading" :on-search="search">
                <SearchText
                    v-model="filters.keyword"
                    width="300px"
                    clearable
                    placeholder="출처·원본 메시지 검색"
                    @clear="search"
                />
                <DropdownList
                    v-model="filters.level"
                    width="150px"
                    clearable
                    placeholder="전체 레벨"
                    option-label="label"
                    option-value="value"
                    :list="levels.map(value => ({ label: value, value }))"
                />
                <SearchText
                    v-model="filters.correlationId"
                    width="210px"
                    clearable
                    placeholder="Correlation ID"
                    :show-suffix-icon="false"
                />
                <SearchText
                    v-model="filters.commandKind"
                    width="170px"
                    clearable
                    placeholder="명령 유형"
                    :show-suffix-icon="false"
                />
                <DropdownList
                    v-model="filters.stage"
                    width="150px"
                    clearable
                    placeholder="처리 단계"
                    option-label="label"
                    option-value="value"
                    :list="stages.map(value => ({ label: value, value }))"
                />
            </SearchBox>
            <Panel class="raw-log-page__panel" :title="title" :subtitle="subtitle" :total="totalCount">
                <template v-if="canDownload" #headerRight>
                    <el-button
                        class="raw-log-page__download-button"
                        plain
                        type="primary"
                        :icon="Download"
                        :loading="isDownloading"
                        @click="download"
                        >CSV 다운로드</el-button
                    >
                </template>

                <div v-if="errorMessage && !logs.length" class="raw-log-page__state is-error">
                    <TriangleAlert :size="34" />
                    <strong>로그를 불러오지 못했습니다.</strong>
                    <p>{{ errorMessage }}</p>
                    <el-button type="primary" @click="loadLogs">다시 시도</el-button>
                </div>

                <el-table
                    v-else
                    v-loading="isLoading"
                    class="raw-log-page__table"
                    :data="logs"
                    height="100%"
                    row-key="id"
                    empty-text="조회된 원본 로그가 없습니다."
                >
                    <el-table-column label="발생 시각" width="178">
                        <template #default="{ row }">{{ formatDateTime(row.occurredAt) }}</template>
                    </el-table-column>
                    <el-table-column label="레벨" width="110" align="center">
                        <template #default="{ row }">
                            <StatusBadge :label="row.level" :variant="levelVariant(row.level)" min-width="76px" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="source" label="출처" min-width="170" show-overflow-tooltip />
                    <el-table-column
                        prop="correlationId"
                        label="Correlation ID"
                        min-width="190"
                        show-overflow-tooltip
                    />
                    <el-table-column label="명령·단계" min-width="170">
                        <template #default="{ row }">
                            <div class="raw-log-page__command-cell">
                                <span>{{ row.commandKind || '-' }}</span>
                                <StatusBadge v-if="row.stage" :label="row.stage" :variant="stageVariant(row.stage)" />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="연결 정보" min-width="190">
                        <template #default="{ row }">
                            <div class="raw-log-page__links">
                                <span v-if="row.robotId">Robot #{{ row.robotId }}</span>
                                <span v-if="row.eventId">Event #{{ row.eventId }}</span>
                                <span v-if="row.notificationId">Notification #{{ row.notificationId }}</span>
                                <span v-if="row.missionExecutionId">Execution #{{ row.missionExecutionId }}</span>
                                <span
                                    v-if="
                                        !row.robotId && !row.eventId && !row.notificationId && !row.missionExecutionId
                                    "
                                    >-</span
                                >
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="message" label="원본 메시지" min-width="300" show-overflow-tooltip />
                    <el-table-column label="원본 데이터" min-width="260">
                        <template #default="{ row }">
                            <code class="raw-log-page__payload">{{ row.payload }}</code>
                        </template>
                    </el-table-column>
                </el-table>

                <Pagination
                    v-if="totalCount"
                    :total-row="totalCount"
                    :page="filters.pageNumber"
                    :row-size="filters.pageSize"
                    @current-change="changePage"
                    @size-change="changePageSize"
                />
            </Panel>
        </template>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ShieldAlert, TriangleAlert } from '@lucide/vue'
import DropdownList from '@/components/DropdownList.vue'
import Pagination from '@/components/Pagination.vue'
import Panel from '@/components/Panel.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchText from '@/components/SearchText.vue'
import { useAuthStore } from '@/stores/auth.store'
import type { ScreenId } from '@/types/accessControl'
import { formatDateTime } from '@/utils/date.util'
import rawLogApi from '../service/rawLog.api'
import type { RawLog, RawLogFilters, RawLogKind, RawLogLevel } from '../service/rawLog.types'

const props = defineProps<{
    screenId: Extract<ScreenId, 'IRCS_RM_03_P' | 'IRCS_EM_02_P'>
    kind: RawLogKind
    title: string
    subtitle: string
    downloadFileName: string
}>()

const levels: RawLogLevel[] = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
const stages = ['ACCEPTED', 'APPLIED', 'REJECTED', 'RUNNING', 'COMPLETED', 'FAILED']
const authStore = useAuthStore()
const logs = ref<RawLog[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const isDownloading = ref(false)
const errorMessage = ref('')
const filters = reactive<RawLogFilters>({
    keyword: '',
    level: '',
    pageNumber: 1,
    pageSize: 20,
    correlationId: '',
    commandKind: '',
    stage: '',
})

const canRead = computed(() => true)
const canDownload = computed(() => true)

const errorText = (error: unknown) => {
    const value = error as { data?: { resultMessage?: string }; response?: { data?: { resultMessage?: string } } }
    return value?.data?.resultMessage || value?.response?.data?.resultMessage || '잠시 후 다시 시도해 주세요.'
}

const loadLogs = async () => {
    if (!canRead.value || isLoading.value) {
        return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await rawLogApi.getLogs(props.kind, { ...filters })
        if (response.result !== 'SUCCESS') {
            throw { data: response }
        }
        logs.value = response.data ?? []
        totalCount.value = response.meta?.totalCount ?? 0
    } catch (error) {
        logs.value = []
        totalCount.value = 0
        errorMessage.value = errorText(error)
    } finally {
        isLoading.value = false
    }
}

const search = () => {
    filters.pageNumber = 1
    loadLogs()
}

const changePage = (page: number) => {
    filters.pageNumber = page
    loadLogs()
}

const changePageSize = (size: number) => {
    filters.pageNumber = 1
    filters.pageSize = size
    loadLogs()
}

const download = async () => {
    if (!canDownload.value || isDownloading.value) {
        return
    }
    isDownloading.value = true
    try {
        const blob = await rawLogApi.downloadLogs(props.kind, {
            keyword: filters.keyword,
            level: filters.level,
            correlationId: filters.correlationId,
            commandKind: filters.commandKind,
            stage: filters.stage,
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = props.downloadFileName
        link.click()
        URL.revokeObjectURL(url)
        ElMessage.success('로그 파일을 다운로드했습니다.')
    } catch (error) {
        ElMessage.error(errorText(error))
    } finally {
        isDownloading.value = false
    }
}

const levelVariant = (level: RawLogLevel): 'muted' | 'info' | 'warning' | 'danger' => {
    if (level === 'CRITICAL' || level === 'ERROR') return 'danger'
    if (level === 'WARNING') return 'warning'
    if (level === 'INFO') return 'info'
    return 'muted'
}

const stageVariant = (stage: string): 'success' | 'warning' | 'danger' | 'progress' | 'info' => {
    if (stage === 'COMPLETED' || stage === 'APPLIED') return 'success'
    if (stage === 'FAILED' || stage === 'REJECTED') return 'danger'
    if (stage === 'RUNNING') return 'progress'
    if (stage === 'ACCEPTED') return 'info'
    return 'warning'
}

onMounted(loadLogs)
</script>

<style scoped lang="scss">
.raw-log-page {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

.raw-log-page__count {
    margin: 0;
    color: var(--text-color--secondary);
}

.raw-log-page__panel {
    flex: 1;
}

.raw-log-page__download-button {
    min-width: 128px;
}

.raw-log-page__level {
    width: 150px;
}

.raw-log-page__table {
    flex: 1;
    min-height: 320px;
}

.raw-log-page__payload {
    color: #b8d7ef;
    font-family: Consolas, monospace;
    font-size: 12px;
}

.raw-log-page__command-cell,
.raw-log-page__links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
}

.raw-log-page__links {
    color: var(--text-color--secondary);
    font-size: 12px;
}

.raw-log-page__state {
    display: flex;
    flex: 1;
    min-height: 320px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--text-color--secondary);
    text-align: center;
}

.raw-log-page__state strong {
    color: var(--text-color--white);
    font-size: 18px;
}

.raw-log-page__state p {
    margin: 0 0 8px;
}

.raw-log-page__state.is-error {
    color: #ff9b9b;
}
</style>
