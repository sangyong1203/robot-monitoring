import { fetchApi } from '@/http'
import type { IntegratedMonitoringSnapshot } from '../integrated/integratedMonitoring.types'

export type TypedMonitoringKind = 'WORK' | 'SURVEILLANCE'
export type RobotCommandType = 'MOVE_TO' | 'SET_MODE' | 'START_MISSION' | 'SAFE_STOP'
export type RobotCommandStatus = 'ACCEPTED' | 'APPLIED' | 'REJECTED'

export type RobotCommandBody = {
    commandType: RobotCommandType
    payload: Record<string, unknown>
    safeStopConfirmed: boolean
}

export type RobotCommandResult = {
    id: number
    robotId: number
    commandType: RobotCommandType
    payload: Record<string, unknown>
    idempotencyKey: string
    status: RobotCommandStatus
    requestedBy: number
    requestedAt: string
    appliedAt: string | null
    stateChangePending: boolean
    replayed: boolean
}

export const getTypedMonitoring = (kind: TypedMonitoringKind) =>
    fetchApi().get<IntegratedMonitoringSnapshot>(
        kind === 'WORK' ? '/api/v1/monitoring/work' : '/api/v1/monitoring/surveillance',
    )

export const sendRobotCommand = (
    robotId: number,
    body: RobotCommandBody,
    idempotencyKey: string,
) =>
    fetchApi().post<RobotCommandResult>('/api/v1/robots/{robotId}/commands', {
        headers: { 'Idempotency-Key': idempotencyKey },
        payload: { path: { robotId }, body },
    })
