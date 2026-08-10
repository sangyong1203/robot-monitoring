import type { Organization, OrganizationQuery, SaveOrganizationPayload } from './organizations.types'

let mockOrganizations: Organization[] = [
    {
        id: 1,
        name: 'KORAD 경주 본원 (대표기관)',
        level: 'HEAD',
        parentId: null,
        address: '경상북도 경주시 문무대왕면 동해안로 1500',
        managerName: '김본원',
        managerContact: '054-750-1000',
        subOrgCount: 2,
        branchOrgCount: 4,
        activeOrgCount: 6,
        activeRobotCount: 7,
        registeredUserCount: 24,
        useSubOrg: true,
        useBranchOrg: true,
        vendorName: '트리거테크',
        vendorContactName: '박엔지니어',
        vendorContactDept: '관제시스템사업부',
        vendorContactPhone: '010-1234-5678',
        isActive: true,
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-08-01T14:20:00Z',
    },
    {
        id: 2,
        name: '중저준위 처분시설 운영센터',
        level: 'SUB',
        parentId: 1,
        parentName: 'KORAD 경주 본원 (대표기관)',
        address: '경상북도 경주시 처분시설동 101',
        managerName: '이처분',
        managerContact: '054-750-2100',
        subOrgCount: 0,
        branchOrgCount: 2,
        activeOrgCount: 2,
        activeRobotCount: 5,
        registeredUserCount: 12,
        useSubOrg: false,
        useBranchOrg: true,
        vendorName: '트리거테크',
        vendorContactName: '최지원',
        vendorContactDept: '현장지원팀',
        vendorContactPhone: '010-9876-5432',
        isActive: true,
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-08-05T11:00:00Z',
    },
    {
        id: 3,
        name: '외곽 경계 감시소',
        level: 'BRANCH',
        parentId: 2,
        parentName: '중저준위 처분시설 운영센터',
        address: '경상북도 경주시 외곽경계 구역',
        managerName: '박경계',
        managerContact: '054-750-3200',
        subOrgCount: 0,
        branchOrgCount: 0,
        activeOrgCount: 1,
        activeRobotCount: 2,
        registeredUserCount: 5,
        useSubOrg: false,
        useBranchOrg: false,
        vendorName: '트리거테크',
        vendorContactName: '강순찰',
        vendorContactDept: '보안솔루션팀',
        vendorContactPhone: '010-5555-4321',
        isActive: true,
        createdAt: '2026-03-10T11:30:00Z',
        updatedAt: '2026-08-07T16:45:00Z',
    },
]

export function fetchMockOrganizations(query?: OrganizationQuery): Promise<Organization[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockOrganizations]
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                result = result.filter(
                    org =>
                        org.name.toLowerCase().includes(kw) ||
                        (org.managerName && org.managerName.toLowerCase().includes(kw)) ||
                        (org.vendorName && org.vendorName.toLowerCase().includes(kw)),
                )
            }
            if (query?.level) {
                result = result.filter(org => org.level === query.level)
            }
            if (query?.isActive !== undefined) {
                result = result.filter(org => org.isActive === query.isActive)
            }
            resolve(result)
        }, 200)
    })
}

export function saveMockOrganization(payload: SaveOrganizationPayload): Promise<Organization> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (payload.id) {
                const idx = mockOrganizations.findIndex(o => o.id === payload.id)
                if (idx !== -1) {
                    mockOrganizations[idx] = {
                        ...mockOrganizations[idx],
                        ...payload,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockOrganizations[idx])
                    return
                }
            }
            const newOrg: Organization = {
                ...payload,
                id: Date.now(),
                subOrgCount: 0,
                branchOrgCount: 0,
                activeOrgCount: 1,
                activeRobotCount: 0,
                registeredUserCount: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            mockOrganizations.unshift(newOrg)
            resolve(newOrg)
        }, 200)
    })
}

export function deleteMockOrganization(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const org = mockOrganizations.find(o => o.id === id)
            if (!org) {
                resolve({ success: false, message: '기관을 찾을 수 없습니다.' })
                return
            }
            if (org.isActive) {
                resolve({
                    success: false,
                    message: '운영 중인 기관은 바로 삭제할 수 없습니다. 비활성화 후 삭제하세요.',
                })
                return
            }
            mockOrganizations = mockOrganizations.filter(o => o.id !== id)
            resolve({ success: true })
        }, 200)
    })
}
