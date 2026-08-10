import type { APIResponse } from '@/http/type'
import type { UserScreenPermission } from '@/types/accessControl'

export type ChangePassword = {
    newPassword: string
    newPasswordConfirm: string
}

export type SigninParams = {
    username: string
    password: string
}

export type SigninData = {
    accessToken: string
    refreshToken: string
    verificationToken?: string
    accessExpiresAt: string
    refreshExpiresAt: string
    landingPage: string
}

export type SigninResponse = APIResponse<SigninData>

export type ChangePasswordParams = {
    newPassword: string
    verificationToken: string
    isAdmin: string
}

export type PasswordResetRequestParams = {
    email: string
    requestType?: string
    isAdmin?: string
}

export type ResetPasswordParams = {
    password: string
    requestType: string
    isAdmin: string
    verificationToken: string
}

export type UserInfo = {
    id?: number
    username?: string
    email?: string
    krName?: string
    name?: string
    role?: string
    userLevel?: string
    landingPage?: string
    permissions?: UserScreenPermission[]
}

export type UserInfoResponse = APIResponse<UserInfo>
