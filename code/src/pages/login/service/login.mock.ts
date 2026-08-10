import type { SigninParams, SigninResponse, UserInfoResponse } from './login.types'

export function fetchMockSignin(params: SigninParams): Promise<SigninResponse> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                result: 'SUCCESS',
                resultMessage: '성공',
                data: {
                    accessToken: 'mock-access-token-12345',
                    refreshToken: 'mock-refresh-token-12345',
                    accessExpiresAt: '2099-12-31T23:59:59Z',
                    refreshExpiresAt: '2099-12-31T23:59:59Z',
                    landingPage: '/admin/organizations',
                },
            })
        }, 200)
    })
}

export function fetchMockUserInfo(): Promise<UserInfoResponse> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                result: 'SUCCESS',
                resultMessage: '성공',
                data: {
                    id: 1,
                    username: 'superadmin',
                    krName: '수퍼 관리자',
                    name: '수퍼 관리자',
                    role: 'SUPER_ADMIN',
                    userLevel: 'SUPER_ADMIN',
                    landingPage: '/admin/organizations',
                    permissions: [],
                },
            })
        }, 200)
    })
}
