import { fetchApi } from '@/http'
import type { APIResponse, PayloadModel } from '@/http/type'
import { fetchMockSignin, fetchMockUserInfo } from './login.mock'
import type {
    ChangePasswordParams,
    PasswordResetRequestParams,
    ResetPasswordParams,
    SigninParams,
    SigninResponse,
    UserInfoResponse,
} from './login.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export default {
    async signin(params: SigninParams): Promise<SigninResponse> {
        if (API_MODE === 'mock') {
            return fetchMockSignin(params)
        }
        try {
            const payload: PayloadModel = { body: params }
            return await fetchApi().post('/api/v1/auth/login', { payload })
        } catch (e) {
            console.warn('[API] Server connection failed, falling back to Mock authentication.', e)
            return fetchMockSignin(params)
        }
    },

    async changePassword(params: ChangePasswordParams): Promise<APIResponse<any>> {
        const payload: PayloadModel = { body: params }
        return await fetchApi().post('/api/v1/auth/password/change', { payload })
    },

    async requestPasswordReset(params: PasswordResetRequestParams): Promise<APIResponse<any>> {
        const payload: PayloadModel = { body: params }
        return await fetchApi().post('/api/v1/auth/password/reset', { payload })
    },

    async resetPassword(params: ResetPasswordParams): Promise<APIResponse<any>> {
        const payload: PayloadModel = { body: params }
        return await fetchApi().put('/api/v1/auth/password/reset', { payload })
    },

    async getUserInfo(): Promise<UserInfoResponse> {
        if (API_MODE === 'mock') {
            return fetchMockUserInfo()
        }
        try {
            return await fetchApi().get('/api/v1/auth/me', {})
        } catch (e) {
            console.warn('[API] Server connection failed, falling back to Mock UserInfo.', e)
            return fetchMockUserInfo()
        }
    },
}
