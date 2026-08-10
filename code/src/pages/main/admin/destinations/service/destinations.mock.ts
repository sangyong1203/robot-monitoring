import type { DestinationItem, DestinationQuery, SaveDestinationPayload } from './destinations.types'

let mockDestinations: DestinationItem[] = [
    {
        id: 1,
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        name: '무인지게차 팰릿 상차지점 A',
        code: 'DEST-WORK-01',
        type: 'WORK_SPOT',
        x: 12.5,
        y: 8.2,
        heading: 90,
        description: '방사성폐기물 팰릿 상차 작업 목적지',
        isActive: true,
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-08-01T10:00:00Z',
    },
    {
        id: 2,
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        name: 'AMR 1호기 교대 대기위치',
        code: 'DEST-WAIT-01',
        type: 'WAITING_SPOT',
        x: 18.0,
        y: 8.2,
        heading: 0,
        description: 'AMR 1호기 처분용기 정면 장입 대기구역',
        isActive: true,
        createdAt: '2026-02-01T09:30:00Z',
        updatedAt: '2026-08-02T11:00:00Z',
    },
    {
        id: 3,
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        name: '산업용 로봇 드럼 정밀 장입위치',
        code: 'DEST-WORK-02',
        type: 'WORK_SPOT',
        x: 25.4,
        y: 15.6,
        heading: 180,
        description: '산업용 정밀 로봇 처분용기 장입 스테이션',
        isActive: true,
        createdAt: '2026-02-05T14:00:00Z',
        updatedAt: '2026-08-03T16:20:00Z',
    },
    {
        id: 4,
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        name: '실내 급속 충전 스테이션 #1',
        code: 'DEST-CHARGE-01',
        type: 'CHARGING_STATION',
        x: 5.0,
        y: 3.5,
        heading: 270,
        description: '무인지게차 및 AMR 공용 자동 도킹 충전소',
        isActive: true,
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-08-04T12:00:00Z',
    },
    {
        id: 5,
        mapId: 2,
        mapName: '외곽 시설물 정밀 순찰 2D 지도',
        name: '외곽 침입 감시 웨이포인트 #1',
        code: 'DEST-PATROL-01',
        type: 'PATROL_WAYPOINT',
        x: 45.0,
        y: 30.0,
        heading: 45,
        description: '4족 보행 로봇 외곽 험지 순찰 포인트',
        isActive: true,
        createdAt: '2026-03-01T09:00:00Z',
        updatedAt: '2026-08-06T14:00:00Z',
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
        }, 200)
    })
}

export function saveMockDestination(payload: SaveDestinationPayload): Promise<DestinationItem> {
    return new Promise(resolve => {
        setTimeout(() => {
            const mapName = payload.mapId === 2 ? '외곽 시설물 정밀 순찰 2D 지도' : '처분용기 장입 실내 1층 도면'
            if (payload.id) {
                const idx = mockDestinations.findIndex(d => d.id === payload.id)
                if (idx !== -1) {
                    mockDestinations[idx] = {
                        ...mockDestinations[idx],
                        ...payload,
                        mapName,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockDestinations[idx])
                    return
                }
            }

            const newDest: DestinationItem = {
                ...payload,
                mapName,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            mockDestinations.unshift(newDest)
            resolve(newDest)
        }, 200)
    })
}

export function deleteMockDestination(id: number): Promise<{ success: boolean }> {
    return new Promise(resolve => {
        setTimeout(() => {
            mockDestinations = mockDestinations.filter(d => d.id !== id)
            resolve({ success: true })
        }, 200)
    })
}
