import type { RobotModelItem, RobotModelQuery, SaveRobotModelPayload } from './robotModels.types'

let mockRobotModels: RobotModelItem[] = [
    {
        id: 1,
        modelCode: 'MODEL-FORKLIFT-01',
        modelName: 'KORAD 실내 중량물 무인지게차 (1.5t)',
        robotType: 'FORKLIFT',
        manufacturer: '두산로보틱스',
        os: 'Ubuntu 22.04 LTS (ROS2 Humble)',
        imageUrl: '',
        registeredRobotCount: 1,
        settings: [
            { key: 'MAX_PAYLOAD_KG', value: '1500', description: '최대 정격 상차 무게' },
            { key: 'MAX_SPEED_MPS', value: '1.2', description: '실내 최고 이동 속도' },
        ],
        monitoringOptions: {
            supportDestinationControl: true,
            supportManualControl: true,
            cameraChannels: ['전방 카메라', '후방 카메라', '포크 카메라'],
            supportScreenShare: true,
            enabledSensors: ['Lidar', '하중 센서', '초음파 센서', '배터리 BMS'],
        },
        isActive: true,
        createdAt: '2026-01-10T09:00:00Z',
        updatedAt: '2026-08-01T10:00:00Z',
    },
    {
        id: 2,
        modelCode: 'MODEL-AMR-01',
        modelName: 'KORAD 처분용기 전용 저상형 AMR',
        robotType: 'AMR',
        manufacturer: '현대로보틱스',
        os: 'ROS2 Humble',
        imageUrl: '',
        registeredRobotCount: 2,
        settings: [
            { key: 'MAX_PAYLOAD_KG', value: '1000', description: '팰릿 적재 정격 하중' },
            { key: 'LIFT_HEIGHT_MM', value: '150', description: '리프팅 승강 높이' },
        ],
        monitoringOptions: {
            supportDestinationControl: true,
            supportManualControl: true,
            cameraChannels: ['전방 카메라', '하부 라인 카메라'],
            supportScreenShare: false,
            enabledSensors: ['Lidar', '적외선 센서', 'BMS'],
        },
        isActive: true,
        createdAt: '2026-01-12T10:00:00Z',
        updatedAt: '2026-08-02T11:00:00Z',
    },
    {
        id: 3,
        modelCode: 'MODEL-ARM-01',
        modelName: '6축 산업용 처분용기 정밀 장입 로봇',
        robotType: 'INDUSTRIAL_ARM',
        manufacturer: 'HD현대로보틱스',
        os: 'Proprietary Robot Controller OS',
        imageUrl: '',
        registeredRobotCount: 1,
        settings: [
            { key: 'REPEATABILITY_MM', value: '0.05', description: '반복 정밀도' },
            { key: 'REACH_MM', value: '2050', description: '암 최대 작업 반경' },
        ],
        monitoringOptions: {
            supportDestinationControl: true,
            supportManualControl: false,
            cameraChannels: ['그리퍼 비전 카메라', '작업 셀 감시 카메라'],
            supportScreenShare: true,
            enabledSensors: ['토크 센서', '비전 센서', '안전 펜스 센서'],
        },
        isActive: true,
        createdAt: '2026-01-15T11:00:00Z',
        updatedAt: '2026-08-03T14:00:00Z',
    },
    {
        id: 4,
        modelCode: 'MODEL-ECCENTRIC-01',
        modelName: '편심 주행 중간 험지 감시 로봇',
        robotType: 'ECCENTRIC_ROBOT',
        manufacturer: '레인보우로보틱스',
        os: 'Ubuntu 20.04 LTS (ROS Noetic)',
        imageUrl: '',
        registeredRobotCount: 1,
        settings: [{ key: 'CLIMB_ANGLE_DEG', value: '25', description: '최대 등판 경사각' }],
        monitoringOptions: {
            supportDestinationControl: true,
            supportManualControl: true,
            cameraChannels: ['PTZ 감시 카메라', '열화상 카메라'],
            supportScreenShare: true,
            enabledSensors: ['가스 센서', '열화상 센서', '온습도 센서', 'Lidar'],
        },
        isActive: true,
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-08-04T16:00:00Z',
    },
    {
        id: 5,
        modelCode: 'MODEL-QUADRUPED-01',
        modelName: '4족 보행 외곽 경계 및 복합 험지 로봇',
        robotType: 'QUADRUPED_ROBOT',
        manufacturer: '보스턴다이나믹스 (Spot)',
        os: 'Spot OS v3.2',
        imageUrl: '',
        registeredRobotCount: 1,
        settings: [{ key: 'MAX_OBSTACLE_HEIGHT_MM', value: '300', description: '최대 수직 장애물 극복 높이' }],
        monitoringOptions: {
            supportDestinationControl: true,
            supportManualControl: true,
            cameraChannels: ['360도 전방위 파노라마 카메라', 'PTZ 줌 카메라'],
            supportScreenShare: true,
            enabledSensors: ['Lidar', '음향 낙상 센서', '가스 센서', 'BMS'],
        },
        isActive: true,
        createdAt: '2026-02-10T14:00:00Z',
        updatedAt: '2026-08-05T17:00:00Z',
    },
    {
        id: 6,
        modelCode: 'MODEL-OUTDOOR-01',
        modelName: '실외 자율주행 보행로 및 일반차도 감시 로봇',
        robotType: 'OUTDOOR_ROBOT',
        manufacturer: '트위니',
        os: 'ROS2 Iron Irwini',
        imageUrl: '',
        registeredRobotCount: 1,
        settings: [{ key: 'MAX_SPEED_KMH', value: '15', description: '차도 모드 최고 속도' }],
        monitoringOptions: {
            supportDestinationControl: true,
            supportManualControl: true,
            cameraChannels: ['주행 차선 카메라', '주위 감시 카메라'],
            supportScreenShare: false,
            enabledSensors: ['GPS/GNSS', '3D Lidar', '초음파', 'BMS'],
        },
        isActive: true,
        createdAt: '2026-02-20T10:00:00Z',
        updatedAt: '2026-08-06T11:00:00Z',
    },
]

export function fetchMockRobotModels(query?: RobotModelQuery): Promise<RobotModelItem[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockRobotModels]
            if (query?.robotType) {
                result = result.filter(m => m.robotType === query.robotType)
            }
            if (query?.keyword) {
                const kw = query.keyword.toLowerCase()
                result = result.filter(
                    m =>
                        m.modelName.toLowerCase().includes(kw) ||
                        m.modelCode.toLowerCase().includes(kw) ||
                        m.manufacturer.toLowerCase().includes(kw),
                )
            }
            if (query?.isActive !== undefined) {
                result = result.filter(m => m.isActive === query.isActive)
            }
            resolve(result)
        }, 200)
    })
}

export function saveMockRobotModel(payload: SaveRobotModelPayload): Promise<RobotModelItem> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (payload.id) {
                const idx = mockRobotModels.findIndex(m => m.id === payload.id)
                if (idx !== -1) {
                    mockRobotModels[idx] = {
                        ...mockRobotModels[idx],
                        ...payload,
                        updatedAt: new Date().toISOString(),
                    }
                    resolve(mockRobotModels[idx])
                    return
                }
            }

            const newModel: RobotModelItem = {
                ...payload,
                id: Date.now(),
                registeredRobotCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            mockRobotModels.unshift(newModel)
            resolve(newModel)
        }, 200)
    })
}
