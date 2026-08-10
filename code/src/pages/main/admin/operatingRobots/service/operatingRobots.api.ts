import { deleteMockOperatingRobot, fetchMockOperatingRobots, saveMockOperatingRobot } from './operatingRobots.mock'
import type { OperatingRobotItem, OperatingRobotQuery, SaveOperatingRobotPayload } from './operatingRobots.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export async function getOperatingRobots(query?: OperatingRobotQuery): Promise<OperatingRobotItem[]> {
    if (API_MODE === 'mock') {
        return fetchMockOperatingRobots(query)
    }
    return fetchMockOperatingRobots(query)
}

export async function saveOperatingRobot(payload: SaveOperatingRobotPayload): Promise<OperatingRobotItem> {
    if (API_MODE === 'mock') {
        return saveMockOperatingRobot(payload)
    }
    return saveMockOperatingRobot(payload)
}

export async function deleteOperatingRobot(id: number): Promise<{ success: boolean }> {
    if (API_MODE === 'mock') {
        return deleteMockOperatingRobot(id)
    }
    return deleteMockOperatingRobot(id)
}
