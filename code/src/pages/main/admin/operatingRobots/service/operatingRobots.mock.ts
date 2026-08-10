import type { OperatingRobotItem, OperatingRobotQuery, SaveOperatingRobotPayload } from './operatingRobots.types'

let mockOperatingRobots: OperatingRobotItem[] = [
    {
        id: 1,
        robotCode: 'RB-FORKLIFT-01',
        name: '무인지게차 1호기',
        modelId: 1,
        modelName: 'KORAD 실내 중량물 무인지게차 (1.5t)',
        robotType: 'FORKLIFT',
        manufacturer: '두산로보틱스',
        orgId: 2,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
        batteryPercent: 88,
        communicationStatus: 'ONLINE',
        status: 'RUNNING',
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        x: 12.5,
        y: 8.2,
        heading: 90,
        memo: '실내 팰릿 이송 담당 주장비',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:45:00Z',
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-08-10T14:45:00Z',
    },
    {
        id: 2,
        robotCode: 'RB-AMR-01',
        name: '저상형 AMR 1호기',
        modelId: 2,
        modelName: 'KORAD 처분용기 전용 저상형 AMR',
        robotType: 'AMR',
        manufacturer: '현대로보틱스',
        orgId: 2,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
        batteryPercent: 92,
        communicationStatus: 'ONLINE',
        status: 'RUNNING',
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        x: 18.0,
        y: 8.2,
        heading: 0,
        memo: '처분용기 메인 교대 운반 1호선',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:46:12Z',
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-08-10T14:46:12Z',
    },
    {
        id: 3,
        robotCode: 'RB-AMR-02',
        name: '저상형 AMR 2호기',
        modelId: 2,
        modelName: 'KORAD 처분용기 전용 저상형 AMR',
        robotType: 'AMR',
        manufacturer: '현대로보틱스',
        orgId: 2,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
        batteryPercent: 75,
        communicationStatus: 'ONLINE',
        status: 'IDLE',
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        x: 5.0,
        y: 3.5,
        heading: 270,
        memo: '처분용기 메인 교대 운반 2호선 (대기 중)',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:46:00Z',
        createdAt: '2026-01-20T10:30:00Z',
        updatedAt: '2026-08-10T14:46:00Z',
    },
    {
        id: 4,
        robotCode: 'RB-ARM-01',
        name: '산업용 장입 로봇 1호기',
        modelId: 3,
        modelName: '6축 산업용 처분용기 정밀 장입 로봇',
        robotType: 'INDUSTRIAL_ARM',
        manufacturer: 'HD현대로보틱스',
        orgId: 2,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
        batteryPercent: 100,
        communicationStatus: 'ONLINE',
        status: 'RUNNING',
        mapId: 1,
        mapName: '처분용기 장입 실내 1층 도면',
        x: 25.4,
        y: 15.6,
        heading: 180,
        memo: '드럼 팰릿 상차 장입 정밀 셀',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:46:20Z',
        createdAt: '2026-01-25T11:00:00Z',
        updatedAt: '2026-08-10T14:46:20Z',
    },
    {
        id: 5,
        robotCode: 'RB-ECCENTRIC-01',
        name: '편심 자율주행 로봇 1호기',
        modelId: 4,
        modelName: '편심 주행 중간 험지 감시 로봇',
        robotType: 'ECCENTRIC_ROBOT',
        manufacturer: '레인보우로보틱스',
        orgId: 3,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소',
        batteryPercent: 64,
        communicationStatus: 'STALE',
        status: 'RUNNING',
        mapId: 2,
        mapName: '외곽 시설물 정밀 순찰 2D 지도',
        x: 32.0,
        y: 20.5,
        heading: 45,
        memo: '중간 경사 지형 전담 감시',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:40:00Z',
        createdAt: '2026-02-05T09:00:00Z',
        updatedAt: '2026-08-10T14:40:00Z',
    },
    {
        id: 6,
        robotCode: 'RB-QUADRUPED-01',
        name: '4족 보행 로봇 1호기 (Spot)',
        modelId: 5,
        modelName: '4족 보행 외곽 경계 및 복합 험지 로봇',
        robotType: 'QUADRUPED_ROBOT',
        manufacturer: '보스턴다이나믹스 (Spot)',
        orgId: 3,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소',
        batteryPercent: 82,
        communicationStatus: 'ONLINE',
        status: 'RUNNING',
        mapId: 2,
        mapName: '외곽 시설물 정밀 순찰 2D 지도',
        x: 45.0,
        y: 30.0,
        heading: 90,
        memo: '외곽 펜스 및 복합 험지 순찰 전담',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:46:05Z',
        createdAt: '2026-02-15T14:00:00Z',
        updatedAt: '2026-08-10T14:46:05Z',
    },
    {
        id: 7,
        robotCode: 'RB-OUTDOOR-01',
        name: '실외 자율주행 로봇 1호기',
        modelId: 6,
        modelName: '실외 자율주행 보행로 및 일반차도 감시 로봇',
        robotType: 'OUTDOOR_ROBOT',
        manufacturer: '트위니',
        orgId: 3,
        orgPath: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소',
        batteryPercent: 95,
        communicationStatus: 'ONLINE',
        status: 'RUNNING',
        mapId: 2,
        mapName: '외곽 시설물 정밀 순찰 2D 지도',
        x: 60.0,
        y: 12.0,
        heading: 180,
        memo: '일반 차도 및 시설물 간 이동 경로 감시',
        isOperating: true,
        lastTelemetryAt: '2026-08-10T14:46:15Z',
        createdAt: '2026-02-25T10:00:00Z',
        updatedAt: '2026-08-10T14:46:15Z',
    },
]

export function fetchMockOperatingRobots(query?: OperatingRobotQuery): Promise<OperatingRobotItem[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockOperatingRobots]
            if (query?.modelId) {
                result = result.filter(r => r.modelId === query.modelId)
            }
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                result = result.filter(
                    r =>
                        r.name.toLowerCase().includes(kw) ||
                        r.robotCode.toLowerCase().includes(kw) ||
                        r.modelName.toLowerCase().includes(kw),
                )
            }
            if (query?.isOperating !== undefined) {
                result = result.filter(r => r.isOperating === query.isOperating)
            }
            resolve(result)
        }, 200)
    })
}

export function saveMockOperatingRobot(payload: SaveOperatingRobotPayload): Promise<OperatingRobotItem> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (payload.id) {
                const idx = mockOperatingRobots.findIndex(r => r.id === payload.id)
                if (idx !== -1) {
                    mockOperatingRobots[idx] = {
                        ...mockOperatingRobots[idx],
                        ...payload,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockOperatingRobots[idx])
                    return
                }
            }

            const newRobot: OperatingRobotItem = {
                ...payload,
                id: Date.now(),
                batteryPercent: 100,
                communicationStatus: 'ONLINE',
                status: 'IDLE',
                lastTelemetryAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            mockOperatingRobots.unshift(newRobot)
            resolve(newRobot)
        }, 200)
    })
}

export function deleteMockOperatingRobot(id: number): Promise<{ success: boolean }> {
    return new Promise(resolve => {
        setTimeout(() => {
            mockOperatingRobots = mockOperatingRobots.filter(r => r.id !== id)
            resolve({ success: true })
        }, 200)
    })
}
