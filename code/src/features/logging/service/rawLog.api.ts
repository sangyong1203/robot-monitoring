import { fetchApi } from '@/http'
import type { PayloadModel } from '@/http/type'
import type { RawLogFilters, RawLogKind, RawLogListResponse, RawLogTraceResponse } from './rawLog.types'

const pathByKind: Record<RawLogKind, string> = {
    ROBOT: '/api/v1/logs/robots',
    EVENT: '/api/v1/logs/events',
}

export default {
    async getLogs(kind: RawLogKind, params: RawLogFilters): Promise<RawLogListResponse> {
        const payload: PayloadModel = { query: params }
        return await fetchApi().get(pathByKind[kind], { payload })
    },

    async downloadLogs(
        kind: RawLogKind,
        params: Pick<RawLogFilters, 'keyword' | 'level' | 'correlationId' | 'commandKind' | 'stage'>,
    ): Promise<Blob> {
        const payload: PayloadModel = { query: params }
        return (await fetchApi().getFile(`${pathByKind[kind]}/download`, { payload })) as unknown as Blob
    },

    async getEventTraceLinks(eventId: number): Promise<RawLogTraceResponse> {
        return await fetchApi().get('/api/v1/logs/traces/events/{eventId}', {
            payload: { path: { eventId } },
        })
    },

    async getNotificationTraceLinks(notificationId: number): Promise<RawLogTraceResponse> {
        return await fetchApi().get('/api/v1/logs/traces/notifications/{notificationId}', {
            payload: { path: { notificationId } },
        })
    },
}
