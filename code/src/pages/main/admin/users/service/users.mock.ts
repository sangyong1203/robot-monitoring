import type { SaveUserPayload, UserItem, UserQuery } from './users.types'

let mockUsers: UserItem[] = [
    {
        id: 1,
        loginId: 'superadmin',
        username: 'superadmin',
        name: '최고관리자',
        userLevel: 'SUPER_ADMIN',
        orgId: 1,
        orgPath: 'KORAD 경주 본원',
        deptName: '통합관제실',
        position: '총괄 책임자',
        phone: '010-1000-0001',
        email: 'super@korad.or.kr',
        receiveSmsAlarm: true,
        receiveEmailAlarm: true,
        receiveEmergencySms: true,
        receiveServiceSms: true,
        notificationChannel: 'SMS',
        isActive: true,
        memo: '시스템 총괄 관리자',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-08-01T10:00:00Z',
        lastLoginAt: '2026-08-10T09:15:00Z',
    },
    {
        id: 2,
        loginId: 'admin01',
        username: 'admin01',
        name: '김관리',
        userLevel: 'ADMIN',
        orgId: 1,
        orgPath: 'KORAD 경주 본원',
        deptName: '안전관제팀',
        position: '팀장',
        phone: '010-2000-0002',
        email: 'admin01@korad.or.kr',
        receiveSmsAlarm: true,
        receiveEmailAlarm: false,
        receiveEmergencySms: true,
        receiveServiceSms: false,
        notificationChannel: 'SMS',
        isActive: true,
        memo: '경주 본원 사이트 관리자',
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-08-02T11:20:00Z',
        lastLoginAt: '2026-08-09T14:30:00Z',
    },
    {
        id: 3,
        loginId: 'operator01',
        username: 'operator01',
        name: '이관제',
        userLevel: 'CONTROL_OPERATOR',
        orgId: 2,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
        deptName: '로봇운용팀',
        position: '선임연구원',
        phone: '010-3000-0003',
        email: 'op01@korad.or.kr',
        receiveSmsAlarm: true,
        receiveEmailAlarm: true,
        receiveEmergencySms: true,
        receiveServiceSms: true,
        notificationChannel: 'SMS',
        isActive: true,
        memo: '주간 주관제 운용자',
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-08-05T08:45:00Z',
        lastLoginAt: '2026-08-10T08:00:00Z',
    },
    {
        id: 4,
        loginId: 'support01',
        username: 'support01',
        name: '박지원',
        userLevel: 'FIELD_SUPPORT',
        orgId: 2,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
        deptName: '현장조치팀',
        position: '주임',
        phone: '010-4000-0004',
        email: 'field01@korad.or.kr',
        receiveSmsAlarm: true,
        receiveEmailAlarm: false,
        receiveEmergencySms: true,
        receiveServiceSms: false,
        notificationChannel: 'SMS',
        isActive: true,
        memo: '2차 현장 출동 조치 담당',
        createdAt: '2026-02-10T14:00:00Z',
        updatedAt: '2026-08-06T15:10:00Z',
        lastLoginAt: '2026-08-08T16:20:00Z',
    },
    {
        id: 5,
        loginId: 'viewer01',
        username: 'viewer01',
        name: '정모니터',
        userLevel: 'VIEWER',
        orgId: 3,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소',
        deptName: '상황관제팀',
        position: '사원',
        phone: '010-5000-0005',
        email: 'viewer01@korad.or.kr',
        receiveSmsAlarm: false,
        receiveEmailAlarm: false,
        receiveEmergencySms: false,
        receiveServiceSms: false,
        notificationChannel: 'NONE',
        isActive: true,
        memo: '상황실 단순 모니터링 모니터',
        createdAt: '2026-03-01T11:00:00Z',
        updatedAt: '2026-08-07T09:30:00Z',
        lastLoginAt: '2026-08-07T18:00:00Z',
    },
]

export function fetchMockUsers(query?: UserQuery): Promise<UserItem[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockUsers]
            if (query?.orgId) {
                result = result.filter(u => u.orgId === query.orgId)
            }
            if (query?.orgIds && query.orgIds.length > 0) {
                result = result.filter(u => query.orgIds!.includes(u.orgId))
            }
            if (query?.userLevel) {
                result = result.filter(u => u.userLevel === query.userLevel)
            }
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                result = result.filter(
                    u =>
                        u.loginId.toLowerCase().includes(kw) ||
                        u.name.toLowerCase().includes(kw) ||
                        u.phone.includes(kw) ||
                        u.email.toLowerCase().includes(kw),
                )
            }
            if (query?.isActive !== undefined) {
                result = result.filter(u => u.isActive === query.isActive)
            }
            resolve(result)
        }, 200)
    })
}

export function saveMockUser(payload: SaveUserPayload): Promise<UserItem> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (payload.id) {
                const idx = mockUsers.findIndex(u => u.id === payload.id)
                if (idx !== -1) {
                    mockUsers[idx] = {
                        ...mockUsers[idx],
                        ...payload,
                        username: payload.loginId,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockUsers[idx])
                    return
                }
            }

            if (mockUsers.some(u => u.loginId === payload.loginId)) {
                reject(new Error('이미 존재하는 아이디입니다.'))
                return
            }

            const newUser: UserItem = {
                ...payload,
                username: payload.loginId,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: null,
            }
            mockUsers.unshift(newUser)
            resolve(newUser)
        }, 200)
    })
}

export function deleteMockUser(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise(resolve => {
        setTimeout(() => {
            mockUsers = mockUsers.filter(u => u.id !== id)
            resolve({ success: true })
        }, 200)
    })
}
