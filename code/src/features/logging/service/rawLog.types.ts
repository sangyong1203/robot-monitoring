import type { APIResponse } from '@/http/type'

export type RawLogKind = 'ROBOT' | 'EVENT'
export type RawLogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export type RawLog = {
    id: number
    logKind: RawLogKind
    robotId: number | null
    eventId: number | null
    notificationId: number | null
    missionExecutionId: number | null
    correlationId: string | null
    commandKind: string | null
    commandId: string | null
    stage: string | null
    source: string
    level: RawLogLevel
    message: string
    payload: string
    occurredAt: string
}

export type RawLogFilters = {
    keyword: string
    level: '' | RawLogLevel
    pageNumber: number
    pageSize: number
    correlationId: string
    commandKind: string
    stage: string
}

export type RawLogListResponse = APIResponse<RawLog[]>

export type RawLogTraceLink = {
    rawLogId: number
    correlationId: string | null
    commandKind: string | null
    commandId: string | null
    stage: string | null
    occurredAt: string
}

export type RawLogTraceResponse = APIResponse<RawLogTraceLink[]>
