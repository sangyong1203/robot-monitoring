import type { CommunicationStatus, RobotStatus, RobotType } from '@/types/enums'

export type OperatingRobotItem = {
    id: number
    robotCode: string
    name: string
    modelId: number
    modelName: string
    robotType: RobotType
    manufacturer: string
    orgId: number
    orgPath: string
    batteryPercent: number
    communicationStatus: CommunicationStatus
    status: RobotStatus
    mapId: number
    mapName: string
    x: number
    y: number
    heading: number
    memo?: string
    isOperating: boolean
    lastTelemetryAt: string
    createdAt: string
    updatedAt: string
}

export type OperatingRobotQuery = {
    keyword?: string
    modelId?: number
    orgId?: number
    isOperating?: boolean
}

export type SaveOperatingRobotPayload = Omit<
    OperatingRobotItem,
    'id' | 'batteryPercent' | 'communicationStatus' | 'status' | 'lastTelemetryAt' | 'createdAt' | 'updatedAt'
> & {
    id?: number
}
