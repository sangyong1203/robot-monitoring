import type {
    IntegratedMonitoringSnapshot,
    MonitoringRobot,
} from '../integrated/integratedMonitoring.types'
import type { TypedMonitoringKind } from './typedMonitoring.api'

export type RobotRealtimeDelta = {
    robots?: unknown[]
    removedRobotIds?: unknown[]
    generatedAt?: string
}

const isMonitoringRobot = (
    value: unknown,
    kind: TypedMonitoringKind,
): value is MonitoringRobot => {
    if (!value || typeof value !== 'object') return false
    const robot = value as Partial<MonitoringRobot>
    return (
        typeof robot.id === 'number' &&
        typeof robot.mapId === 'number' &&
        robot.robotType === kind &&
        ['ONLINE', 'STALE', 'OFFLINE'].includes(String(robot.communicationStatus))
    )
}

const calculateCounts = (items: MonitoringRobot[]) => ({
    total: items.length,
    online: items.filter(item => item.communicationStatus === 'ONLINE').length,
    stale: items.filter(item => item.communicationStatus === 'STALE').length,
    offline: items.filter(item => item.communicationStatus === 'OFFLINE').length,
    work: items.filter(item => item.robotType === 'WORK').length,
    surveillance: items.filter(item => item.robotType === 'SURVEILLANCE').length,
})

export const mergeRobotRealtimeDelta = (
    snapshot: IntegratedMonitoringSnapshot,
    kind: TypedMonitoringKind,
    delta: RobotRealtimeDelta,
): { snapshot: IntegratedMonitoringSnapshot; needsResync: boolean } => {
    const updates = (delta.robots ?? []).filter(value => isMonitoringRobot(value, kind))
    if (updates.some(robot => !snapshot.maps.some(map => map.id === robot.mapId))) {
        return { snapshot, needsResync: true }
    }
    const updateIds = new Set(updates.map(robot => robot.id))
    const removedIds = new Set(
        (delta.removedRobotIds ?? []).filter((id): id is number => typeof id === 'number'),
    )
    const maps = snapshot.maps.map(map => ({
        ...map,
        robots: [
            ...map.robots.filter(robot => !updateIds.has(robot.id) && !removedIds.has(robot.id)),
            ...updates.filter(robot => robot.mapId === map.id),
        ],
    }))
    const robots = maps.flatMap(map => map.robots)
    return {
        needsResync: false,
        snapshot: {
            ...snapshot,
            generatedAt: delta.generatedAt ?? snapshot.generatedAt,
            maps,
            robots,
            counts: calculateCounts(robots),
        },
    }
}
