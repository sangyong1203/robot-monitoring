import type { UserLevel } from '@/types/enums'

export type UserItem = {
    id: number
    loginId: string
    username?: string
    name: string
    userLevel: UserLevel
    orgId: number
    orgPath: string
    deptName?: string
    position?: string
    phone: string
    email: string
    receiveSmsAlarm?: boolean
    receiveEmailAlarm?: boolean
    receiveEmergencySms?: boolean
    receiveServiceSms?: boolean
    notificationChannel?: 'SMS' | 'NONE'
    isActive: boolean
    memo?: string
    createdAt: string
    updatedAt: string
    lastLoginAt?: string | null
}

export type UserQuery = {
    orgId?: number
    orgIds?: number[]
    userLevel?: UserLevel
    keyword?: string
    isActive?: boolean
}

export type SaveUserPayload = Omit<UserItem, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'> & {
    id?: number
    password?: string
}
