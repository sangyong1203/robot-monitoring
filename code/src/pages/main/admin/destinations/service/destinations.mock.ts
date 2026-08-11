import type { DestinationItem, DestinationQuery, SaveDestinationPayload } from './destinations.types'

let mockDestinations: DestinationItem[] = [
    {
        id: 1,
        mapId: 2,
        mapName: 'ZONE A : 처분용기 장입 실내 1층 도면',
        name: '무인지게차 팰릿 상차지점 A',
        code: 'DEST-WORK-01',
        type: 'WORK_SPOT',
        x: 12.5,
        y: 8.2,
        siteX: 16.0,
        siteY: 10.0,
        heading: 90,
        targetRobotType: 'WORK',
        description: '방사성폐기물 팰릿 상차 작업 목적지',
        isActive: true,
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-08-01T10:00:00Z',
    },
    {
        id: 2,
        mapId: 2,
        mapName: 'ZONE A : 처분용기 장입 실내 1층 도면',
        name: 'AMR 1호기 교대 대기위치',
        code: 'DEST-WAIT-01',
        type: 'WAITING_SPOT',
        x: 18.0,
        y: 8.2,
        siteX: 24.0,
        siteY: 10.0,
        heading: 0,
        targetRobotType: 'WORK',
        description: 'AMR 1호기 처분용기 정면 장입 대기구역',
        isActive: true,
        createdAt: '2026-02-01T09:30:00Z',
        updatedAt: '2026-08-02T11:00:00Z',
    },
    {
        id: 3,
        mapId: 4,
        mapName: 'ZONE B : 방사성 폐기물 인수검사동 2D 도면',
        name: '산업용 로봇 드럼 정밀 장입위치',
        code: 'DEST-WORK-02',
        type: 'WORK_SPOT',
        x: 25.4,
        y: 15.6,
        siteX: 78.0,
        siteY: 14.0,
        heading: 180,
        targetRobotType: 'WORK',
        description: '산업용 정밀 로봇 처분용기 장입 스테이션',
        isActive: true,
        createdAt: '2026-02-05T14:00:00Z',
        updatedAt: '2026-08-03T16:20:00Z',
    },
    {
        id: 4,
        mapId: 2,
        mapName: 'ZONE A : 처분용기 장입 실내 1층 도면',
        name: '실내 급속 충전 스테이션 #1',
        code: 'DEST-CHARGE-01',
        type: 'CHARGING_STATION',
        x: 5.0,
        y: 3.5,
        siteX: 8.0,
        siteY: 18.0,
        heading: 270,
        targetRobotType: 'WORK',
        description: '무인지게차 및 AMR 공용 자동 도킹 충전소',
        isActive: true,
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-08-04T12:00:00Z',
    },
    {
        id: 5,
        mapId: 3,
        mapName: 'ZONE C : 외곽 시설물 정밀 순찰 2D 지도',
        name: '외곽 침입 감시 웨이포인트 #1',
        code: 'DEST-PATROL-01',
        type: 'PATROL_WAYPOINT',
        x: 45.0,
        y: 30.0,
        siteX: 60.0,
        siteY: 38.0,
        heading: 45,
        targetRobotType: 'SURVEILLANCE',
        description: '4족 보행 로봇(Spot) 외곽 험지 순찰 포인트',
        isActive: true,
        createdAt: '2026-03-01T09:00:00Z',
        updatedAt: '2026-08-06T14:00:00Z',
    },
    {
        id: 6,
        mapId: 1,
        mapName: 'KORAD 시설 종합 배치도 (Site Map)',
        name: '정문 보안 검문소 마커',
        code: 'DEST-GATE-01',
        type: 'WAITING_SPOT',
        x: 40.0,
        y: 38.0,
        siteX: 40.0,
        siteY: 38.0,
        heading: 0,
        targetRobotType: 'ALL',
        description: '전체 부지 정문 차량 및 로봇 입출고 검문소',
        isActive: true,
        createdAt: '2026-03-10T10:00:00Z',
        updatedAt: '2026-08-10T11:00:00Z',
    },
]

export function fetchMockDestinations(query?: DestinationQuery): Promise<DestinationItem[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockDestinations]
            if (query?.mapId) {
                result = result.filter(d => d.mapId === query.mapId)
            }
            if (query?.type) {
                result = result.filter(d => d.type === query.type)
            }
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                result = result.filter(
                    d => d.name.toLowerCase().includes(kw) || d.code.toLowerCase().includes(kw),
                )
            }
            resolve(result)
        }, 100)
    })
}

export function saveMockDestination(payload: SaveDestinationPayload): Promise<DestinationItem> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (payload.id) {
                const idx = mockDestinations.findIndex(d => d.id === payload.id)
                if (idx !== -1) {
                    mockDestinations[idx] = {
                        ...mockDestinations[idx],
                        ...payload,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockDestinations[idx])
                    return
                }
            }

            const newDest: DestinationItem = {
                ...payload,
                mapName: payload.mapName || '기본 지도',
                id: Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            mockDestinations.unshift(newDest)
            resolve(newDest)
        }, 100)
    })
}

export function deleteMockDestination(id: number): Promise<{ success: boolean }> {
    return new Promise(resolve => {
        setTimeout(() => {
            mockDestinations = mockDestinations.filter(d => d.id !== id)
            resolve({ success: true })
        }, 100)
    })
}
