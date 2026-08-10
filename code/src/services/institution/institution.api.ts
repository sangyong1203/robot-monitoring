import { fetchApi } from '@/http'
import type { InstitutionListResponse, InstitutionResponse, InstitutionSaveParams } from './institution.types'

export default {
    async getInstitutions(keyword = '', active = ''): Promise<InstitutionListResponse> {
        return await fetchApi().get('/api/v1/system/institutions', {
            payload: { query: { keyword, active } },
        })
    },
    async createInstitution(body: InstitutionSaveParams): Promise<InstitutionResponse> {
        return await fetchApi().post('/api/v1/system/institutions', { payload: { body } })
    },
    async updateInstitution(id: number, body: InstitutionSaveParams): Promise<InstitutionResponse> {
        return await fetchApi().put('/api/v1/system/institutions/{id}', { payload: { path: { id }, body } })
    },
    async deleteInstitution(id: number): Promise<InstitutionResponse> {
        return await fetchApi().delete('/api/v1/system/institutions/{id}', { payload: { path: { id } } })
    },
}
