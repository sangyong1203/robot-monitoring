import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import type { RequestConfig } from './index'

let refreshPromise: Promise<string> | null = null

const requestAccessToken = async (): Promise<string> => {
    const authStore = useAuthStore()
    const refreshToken = authStore.authState.tokens.refreshToken
    if (!refreshToken) {
        throw new Error('Refresh token is not available.')
    }

    const response = await axios.post('/api/v1/auth/reissue', { refreshToken })
    const session = response.data?.data
    if (!session?.accessToken || !session?.refreshToken) {
        throw new Error('Token reissue response is invalid.')
    }

    authStore.setTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
    })
    return session.accessToken
}

export const refreshAccessToken = async (props: {
    config: RequestConfig
    resolve: (value: any) => void
    reject: (reason?: any) => void
}): Promise<void> => {
    const { config, resolve, reject } = props
    const authStore = useAuthStore()

    if (!authStore.authState.user?.loginId) {
        reject(new Error('Authenticated user is not available.'))
        return
    }

    try {
        refreshPromise ??= requestAccessToken().finally(() => {
            refreshPromise = null
        })
        const accessToken = await refreshPromise

        if (config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        const retryResponse = await axios.request(config)
        resolve(retryResponse.data)
    } catch (error) {
        authStore.clearSession()
        reject(error)
        window.location.replace('/login')
    }
}
