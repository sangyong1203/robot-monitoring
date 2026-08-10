import { deleteMockUser, fetchMockUsers, saveMockUser } from './users.mock'
import type { SaveUserPayload, UserItem, UserQuery } from './users.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export async function getUsers(query?: UserQuery): Promise<UserItem[]> {
    if (API_MODE === 'mock') {
        return fetchMockUsers(query)
    }
    return fetchMockUsers(query)
}

export async function saveUser(payload: SaveUserPayload): Promise<UserItem> {
    if (API_MODE === 'mock') {
        return saveMockUser(payload)
    }
    return saveMockUser(payload)
}

export async function deleteUser(id: number): Promise<{ success: boolean; message?: string }> {
    if (API_MODE === 'mock') {
        return deleteMockUser(id)
    }
    return deleteMockUser(id)
}
