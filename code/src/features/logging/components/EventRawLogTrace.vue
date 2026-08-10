<template>
    <section class="event-raw-log-trace" aria-label="기술 원본 로그 연결">
        <header class="event-raw-log-trace__header">
            <div>
                <strong>기술 원본 로그 연결</strong>
                <span>사용자용 이벤트 설명과 분리된 추적 식별 정보입니다.</span>
            </div>
        </header>

        <div v-if="loading && !links.length" class="event-raw-log-trace__state">불러오는 중...</div>
        <div v-else-if="error" class="event-raw-log-trace__state is-error">
            {{ error }}
        </div>
        <div v-else-if="!links.length" class="event-raw-log-trace__state">
            연결된 기술 원본 로그가 없습니다.
        </div>
        <ul v-else class="event-raw-log-trace__list">
            <li v-for="link in links" :key="link.rawLogId">
                <StatusBadge :label="link.stage || 'TRACE'" :variant="stageVariant(link.stage)" />
                <div>
                    <strong>Raw Log #{{ link.rawLogId }}</strong>
                    <span>{{ link.commandKind || 'EVENT_TRACE' }} · {{ link.correlationId || '-' }}</span>
                </div>
                <time>{{ formatDateTime(link.occurredAt) }}</time>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatDateTime } from '@/utils/date.util'
import rawLogApi from '../service/rawLog.api'
import type { RawLogTraceLink } from '../service/rawLog.types'

const props = defineProps<{ eventId: number }>()
const links = ref<RawLogTraceLink[]>([])
const loading = ref(false)
const error = ref('')

const load = async () => {
    if (!props.eventId || loading.value) return
    loading.value = true
    error.value = ''
    try {
        const response = await rawLogApi.getEventTraceLinks(props.eventId)
        if (response.result !== 'SUCCESS') throw response
        links.value = response.data ?? []
    } catch (value) {
        links.value = []
        error.value = (value as { resultMessage?: string })?.resultMessage || '추적 정보를 불러오지 못했습니다.'
    } finally {
        loading.value = false
    }
}

const stageVariant = (stage: string | null): 'success' | 'danger' | 'progress' | 'info' => {
    if (stage === 'COMPLETED' || stage === 'APPLIED') return 'success'
    if (stage === 'FAILED' || stage === 'REJECTED') return 'danger'
    if (stage === 'RUNNING') return 'progress'
    return 'info'
}

watch(() => props.eventId, load)
onMounted(load)
</script>

<style scoped lang="scss">
.event-raw-log-trace {
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
}

.event-raw-log-trace__header,
.event-raw-log-trace__list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
}

.event-raw-log-trace__header {
    margin-bottom: 12px;
}

.event-raw-log-trace__header div,
.event-raw-log-trace__list li div {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.event-raw-log-trace__header strong,
.event-raw-log-trace__list strong {
    color: var(--text-color--white);
}

.event-raw-log-trace__header span,
.event-raw-log-trace__list span,
.event-raw-log-trace__list time,
.event-raw-log-trace__state {
    color: var(--text-color--secondary);
    font-size: 12px;
}

.event-raw-log-trace__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;
}

.event-raw-log-trace__list li {
    justify-content: flex-start;
    padding: 10px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.04);
}

.event-raw-log-trace__list li div {
    flex: 1;
}

.event-raw-log-trace__state {
    padding: 18px;
    text-align: center;
}

.event-raw-log-trace__state.is-error {
    color: #ff9b9b;
}
</style>
