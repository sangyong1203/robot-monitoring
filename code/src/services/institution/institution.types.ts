import type { APIResponse } from '@/http/type'

export type Institution = {
    id: number
    code: string
    name: string
    contactName: string
    contactEmail: string
    phone: string
    address: string
    isActive: boolean
    createdAt: string
}

export type InstitutionSaveParams = Omit<Institution, 'id' | 'createdAt'>
export type InstitutionListResponse = APIResponse<Institution[]>
export type InstitutionResponse = APIResponse<Institution>
