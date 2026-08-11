import type { MapItem, MapQuery, SaveMapPayload } from './maps.types'

let mockMaps: MapItem[] = [
    {
        id: 1,
        code: 'MAP-SITE-01',
        name: 'KORAD 시설 종합 배치도 (Site Map)',
        mapType: 'OUTDOOR',
        orgName: '통합관제센터',
        regionName: 'KORAD 경주 본원',
        zoneName: '본원 전체 부지 구역',
        fileName: 'site_map_master.png',
        fileSize: 8900000,
        imageUrl: '/sample_map/site_map.svg',
        width: 1600,
        height: 800,
        resolution: 0.05,
        originX: 0,
        originY: 0,
        origin_x: 0,
        origin_y: 0,
        isPrimary: true,
        isActive: true,
        description: '전체 부지 3개 구역(Zone A, B, C) 및 이기종 로봇 7대 통합 실시간 관제 종합 배치도',
        linkedRobotCount: 7,
        linkedDestinationCount: 24,
        registeredByName: '최관제',
        createdAt: '2026-01-10T09:00:00Z',
        updatedAt: '2026-08-11T12:00:00Z',
    },
    {
        id: 2,
        code: 'MAP-INDOOR-01',
        name: 'ZONE A : 처분용기 장입 실내 1층 도면',
        mapType: 'INDOOR',
        orgName: '중저준위 처분시설 운영센터',
        regionName: 'KORAD 경주 본원',
        zoneName: '실내 처분용기 장입구역',
        fileName: 'indoor_disposal_building_1f.svg',
        fileSize: 4520000,
        imageUrl: '/sample_map/indoor_disposal_map.svg',
        width: 1400,
        height: 800,
        resolution: 0.05,
        originX: 0,
        originY: 0,
        origin_x: 0,
        origin_y: 0,
        isPrimary: false,
        isActive: true,
        description: '무인지게차, AMR 2대 협력 이송 작업용 실내 2D 지도 (1400x800)',
        linkedRobotCount: 3,
        linkedDestinationCount: 8,
        registeredByName: '김본원',
        createdAt: '2026-01-20T09:00:00Z',
        updatedAt: '2026-08-01T15:30:00Z',
    },
    {
        id: 3,
        code: 'MAP-OUTDOOR-01',
        name: 'ZONE C : 외곽 시설물 정밀 순찰 2D 지도',
        mapType: 'OUTDOOR',
        orgName: '외곽 경계 감시소',
        regionName: 'KORAD 경주 본원',
        zoneName: '외곽 경계 감시 구역',
        fileName: 'outdoor_patrol_zone.svg',
        fileSize: 7800000,
        imageUrl: '/sample_map/outdoor_patrol_map.svg',
        width: 1600,
        height: 500,
        resolution: 0.1,
        originX: 0,
        originY: 0,
        origin_x: 0,
        origin_y: 0,
        isPrimary: false,
        isActive: true,
        description: '편심 자율주행, Spot 4족 보행, 실외 자율주행 로봇 외부 순찰 전용 지도 (1600x500)',
        linkedRobotCount: 3,
        linkedDestinationCount: 12,
        registeredByName: '박경계',
        createdAt: '2026-02-15T11:00:00Z',
        updatedAt: '2026-08-05T10:20:00Z',
    },
    {
        id: 4,
        code: 'MAP-INDOOR-02',
        name: 'ZONE B : 방사성 폐기물 인수검사동 2D 도면',
        mapType: 'INDOOR',
        orgName: '폐기물 검사 센터',
        regionName: 'KORAD 경주 본원',
        zoneName: '인수 검사 1구역',
        fileName: 'radioactive_inspection_building.svg',
        fileSize: 5200000,
        imageUrl: '/sample_map/inspection_building_map.svg',
        width: 1400,
        height: 800,
        resolution: 0.05,
        originX: 0,
        originY: 0,
        origin_x: 0,
        origin_y: 0,
        isPrimary: false,
        isActive: true,
        description: '산업용 장입 로봇 1호기 인수검사 및 고정밀 작업 전용 실내 도면',
        linkedRobotCount: 1,
        linkedDestinationCount: 6,
        registeredByName: '이검사',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-08-08T14:10:00Z',
    },
]

export function fetchMockMaps(query?: MapQuery): Promise<MapItem[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockMaps]
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                result = result.filter(
                    m =>
                        m.name.toLowerCase().includes(kw) ||
                        m.code.toLowerCase().includes(kw) ||
                        m.zoneName.toLowerCase().includes(kw),
                )
            }
            if (query?.mapType) {
                result = result.filter(m => m.mapType === query.mapType)
            }
            if (query?.isActive !== undefined) {
                result = result.filter(m => m.isActive === query.isActive)
            }
            resolve(result)
        }, 200)
    })
}

export function saveMockMap(payload: SaveMapPayload): Promise<MapItem> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (payload.id) {
                const idx = mockMaps.findIndex(m => m.id === payload.id)
                if (idx !== -1) {
                    if (payload.isPrimary) {
                        mockMaps.forEach(m => (m.isPrimary = false))
                    }
                    mockMaps[idx] = {
                        ...mockMaps[idx],
                        ...payload,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockMaps[idx])
                    return
                }
            }

            if (payload.isPrimary) {
                mockMaps.forEach(m => (m.isPrimary = false))
            }

            const newMap: MapItem = {
                ...payload,
                id: Date.now(),
                linkedRobotCount: 0,
                linkedDestinationCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            mockMaps.unshift(newMap)
            resolve(newMap)
        }, 200)
    })
}

export function deleteMockMap(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise(resolve => {
        setTimeout(() => {
            const target = mockMaps.find(m => m.id === id)
            if (!target) {
                resolve({ success: false, message: '지도를 찾을 수 없습니다.' })
                return
            }
            if (target.isPrimary) {
                resolve({
                    success: false,
                    message: '대표 지도는 삭제할 수 없습니다. 먼저 다른 지도를 대표 지도로 지정하세요.',
                })
                return
            }
            mockMaps = mockMaps.filter(m => m.id !== id)
            resolve({ success: true })
        }, 200)
    })
}
