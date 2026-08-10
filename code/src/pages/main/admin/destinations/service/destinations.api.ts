import { deleteMockDestination, fetchMockDestinations, saveMockDestination } from './destinations.mock'
import type { DestinationItem, DestinationQuery, SaveDestinationPayload } from './destinations.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export async function getDestinations(query?: DestinationQuery): Promise<DestinationItem[]> {
    if (API_MODE === 'mock') {
        return fetchMockDestinations(query)
    }
    return fetchMockDestinations(query)
}

export async function saveDestination(payload: SaveDestinationPayload): Promise<DestinationItem> {
    if (API_MODE === 'mock') {
        return saveMockDestination(payload)
    }
    return saveMockDestination(payload)
}

export async function deleteDestination(id: number): Promise<{ success: boolean }> {
    if (API_MODE === 'mock') {
        return deleteMockDestination(id)
    }
    return deleteMockDestination(id)
}
