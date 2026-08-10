import { describe, expect, it } from 'vitest'
import type { IntegratedMonitoringSnapshot, MonitoringRobot } from '../integrated/integratedMonitoring.types'
import { mergeRobotRealtimeDelta } from './realtimeRobotMerge'

const robot = (id: number, status: MonitoringRobot['communicationStatus']): MonitoringRobot => ({
    id,
    robotModelId: 1,
    modelCode: 'AMR',
    modelName: 'AMR',
    robotType: 'WORK',
    code: `WORK-${id}`,
    name: `작업 로봇 ${id}`,
    serialNumber: `SN-${id}`,
    institutionId: null,
    institutionName: '',
    buildingId: null,
    buildingName: '',
    buildingZoneId: null,
    buildingZoneName: '',
    initialMapId: null,
    initialMapName: '',
    initialPoiId: null,
    initialPoiName: '',
    macAddress: '',
    ipAddress: '',
    endpoint: '',
    pingIntervalSeconds: 30,
    credentialReference: '',
    status: 'RUNNING',
    batteryPercent: 80,
    x: 1,
    y: 2,
    heading: 0,
    lastSeenAt: '2026-07-31T00:00:00Z',
    isActive: true,
    createdAt: '2026-07-31T00:00:00Z',
    updatedAt: '2026-07-31T00:00:00Z',
    mapId: 1,
    communicationStatus: status,
})

const snapshot = (): IntegratedMonitoringSnapshot => {
    const first = robot(1, 'ONLINE')
    return {
        generatedAt: '2026-07-31T00:00:00Z',
        counts: { total: 1, online: 1, stale: 0, offline: 0, work: 1, surveillance: 0 },
        robots: [first],
        maps: [
            {
                id: 1,
                code: 'MAP',
                name: '맵',
                imageUrl: '',
                mapType: 'INDOOR',
                version: '1.0',
                coordinateSystem: 'MAP',
                rotation: 0,
                width: 100,
                height: 100,
                resolution: 0.1,
                origin_x: 0,
                origin_y: 0,
                isActive: true,
                robotCount: 1,
                createdAt: '',
                updatedAt: '',
                robots: [first],
            },
        ],
    }
}

describe('mergeRobotRealtimeDelta', () => {
    it('upserts robots, removes missing robots, and recalculates counts', () => {
        const update = robot(2, 'STALE')
        const result = mergeRobotRealtimeDelta(snapshot(), 'WORK', {
            robots: [update],
            removedRobotIds: [1],
            generatedAt: '2026-07-31T00:00:05Z',
        })

        expect(result.needsResync).toBe(false)
        expect(result.snapshot.robots.map(item => item.id)).toEqual([2])
        expect(result.snapshot.counts).toEqual({
            total: 1,
            online: 0,
            stale: 1,
            offline: 0,
            work: 1,
            surveillance: 0,
        })
    })

    it('ignores robots belonging to the other monitoring type', () => {
        const surveillance = { ...robot(2, 'ONLINE'), robotType: 'SURVEILLANCE' as const }
        const result = mergeRobotRealtimeDelta(snapshot(), 'WORK', { robots: [surveillance] })

        expect(result.snapshot.robots.map(item => item.id)).toEqual([1])
    })

    it('requests REST resynchronization when a delta references an unknown map', () => {
        const update = { ...robot(2, 'ONLINE'), mapId: 99 }
        const result = mergeRobotRealtimeDelta(snapshot(), 'WORK', { robots: [update] })

        expect(result.needsResync).toBe(true)
        expect(result.snapshot.robots.map(item => item.id)).toEqual([1])
    })
})
