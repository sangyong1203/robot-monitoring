import { deleteMockOrganization, fetchMockOrganizations, saveMockOrganization } from './organizations.mock'
import type { Organization, OrganizationQuery, SaveOrganizationPayload } from './organizations.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export async function getOrganizations(query?: OrganizationQuery): Promise<Organization[]> {
    if (API_MODE === 'mock') {
        return fetchMockOrganizations(query)
    }
    // Server implementation fallback
    return fetchMockOrganizations(query)
}

export async function saveOrganization(payload: SaveOrganizationPayload): Promise<Organization> {
    if (API_MODE === 'mock') {
        return saveMockOrganization(payload)
    }
    return saveMockOrganization(payload)
}

export async function deleteOrganization(id: number): Promise<{ success: boolean; message?: string }> {
    if (API_MODE === 'mock') {
        return deleteMockOrganization(id)
    }
    return deleteMockOrganization(id)
}
