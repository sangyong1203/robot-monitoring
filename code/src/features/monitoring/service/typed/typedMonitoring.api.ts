import { fetchApi } from '@/http'
import type { IntegratedMonitoringSnapshot } from '../integrated/integratedMonitoring.types'
import { mockIntegratedSnapshot } from '../integrated/integratedMonitoring.api'
import { fetchMockMaps } from '@/pages/main/admin/maps/service/maps.mock'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export type TypedMonitoringKind = 'INTEGRATED' | 'WORK' | 'SURVEILLANCE'
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

export const getTypedMonitoring = async (kind: TypedMonitoringKind) => {
    let filteredRobots = mockIntegratedSnapshot.robots
    if (kind === 'WORK') filteredRobots = mockIntegratedSnapshot.robots.filter(r => r.robotType === 'WORK')
    else if (kind === 'SURVEILLANCE') filteredRobots = mockIntegratedSnapshot.robots.filter(r => r.robotType === 'SURVEILLANCE')

    const activeMaps = await fetchMockMaps({ isActive: true })
    const snapshotMaps = activeMaps.length > 0 ? activeMaps.map(m => ({ ...m, robots: [] })) : mockIntegratedSnapshot.maps

    const snapshotData: IntegratedMonitoringSnapshot = {
        ...mockIntegratedSnapshot,
        maps: snapshotMaps,
        robots: filteredRobots,
        counts: {
            total: filteredRobots.length,
            online: filteredRobots.filter(r => r.communicationStatus === 'ONLINE').length,
            stale: filteredRobots.filter(r => r.communicationStatus === 'STALE').length,
            offline: filteredRobots.filter(r => r.communicationStatus === 'OFFLINE').length,
            work: filteredRobots.filter(r => r.robotType === 'WORK').length,
            surveillance: filteredRobots.filter(r => r.robotType === 'SURVEILLANCE').length,
        },
    }

    if (API_MODE === 'mock') {
        return { data: snapshotData, result: 'SUCCESS', resultMessage: '성공' }
    }

    try {
        let endpoint = '/api/v1/monitoring/integrated'
        if (kind === 'WORK') endpoint = '/api/v1/monitoring/work'
        else if (kind === 'SURVEILLANCE') endpoint = '/api/v1/monitoring/surveillance'

        return await fetchApi().get<IntegratedMonitoringSnapshot>(endpoint)
    } catch {
        return { data: snapshotData, result: 'SUCCESS', resultMessage: '성공' }
    }
}

export const sendRobotCommand = async (
    robotId: number,
    body: RobotCommandBody,
    idempotencyKey: string,
) => {
    if (API_MODE === 'mock') {
        return {
            data: {
                id: Date.now(),
                robotId,
                commandType: body.commandType,
                payload: body.payload,
                idempotencyKey,
                status: 'APPLIED' as RobotCommandStatus,
                requestedBy: 1,
                requestedAt: new Date().toISOString(),
                appliedAt: new Date().toISOString(),
                stateChangePending: false,
                replayed: false,
            },
            result: 'SUCCESS',
            resultMessage: '성공',
        }
    }

    try {
        return await fetchApi().post<RobotCommandResult>('/api/v1/robots/{robotId}/commands', {
            headers: { 'Idempotency-Key': idempotencyKey },
            payload: { path: { robotId }, body },
        })
    } catch {
        return {
            data: {
                id: Date.now(),
                robotId,
                commandType: body.commandType,
                payload: body.payload,
                idempotencyKey,
                status: 'APPLIED' as RobotCommandStatus,
                requestedBy: 1,
                requestedAt: new Date().toISOString(),
                appliedAt: new Date().toISOString(),
                stateChangePending: false,
                replayed: false,
            },
            result: 'SUCCESS',
            resultMessage: '성공',
        }
    }
}
