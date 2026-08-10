import { deleteMockMap, fetchMockMaps, saveMockMap } from './maps.mock'
import type { MapItem, MapQuery, SaveMapPayload } from './maps.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export async function getMaps(query?: MapQuery): Promise<MapItem[]> {
    if (API_MODE === 'mock') {
        return fetchMockMaps(query)
    }
    return fetchMockMaps(query)
}

export async function saveMap(payload: SaveMapPayload): Promise<MapItem> {
    if (API_MODE === 'mock') {
        return saveMockMap(payload)
    }
    return saveMockMap(payload)
}

export async function deleteMap(id: number): Promise<{ success: boolean; message?: string }> {
    if (API_MODE === 'mock') {
        return deleteMockMap(id)
    }
    return deleteMockMap(id)
}
