import { fetchMockRobotModels, saveMockRobotModel } from './robotModels.mock'
import type { RobotModelItem, RobotModelQuery, SaveRobotModelPayload } from './robotModels.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export async function getRobotModels(query?: RobotModelQuery): Promise<RobotModelItem[]> {
    if (API_MODE === 'mock') {
        return fetchMockRobotModels(query)
    }
    return fetchMockRobotModels(query)
}

export async function saveRobotModel(payload: SaveRobotModelPayload): Promise<RobotModelItem> {
    if (API_MODE === 'mock') {
        return saveMockRobotModel(payload)
    }
    return saveMockRobotModel(payload)
}
