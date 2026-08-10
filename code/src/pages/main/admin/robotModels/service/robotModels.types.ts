import type { RobotType } from '@/types/enums'

export type RobotModelSetting = {
    key: string
    value: string
    description?: string
}

export type RobotMonitoringOptions = {
    supportDestinationControl: boolean
    supportManualControl: boolean
    cameraChannels: string[]
    supportScreenShare: boolean
    enabledSensors: string[]
}

export type RobotModelItem = {
    id: number
    modelCode: string
    modelName: string
    robotType: RobotType
    manufacturer: string
    os: string
    imageUrl?: string
    registeredRobotCount: number
    settings: RobotModelSetting[]
    monitoringOptions: RobotMonitoringOptions
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type RobotModelQuery = {
    keyword?: string
    robotType?: RobotType
    isActive?: boolean
}

export type SaveRobotModelPayload = Omit<RobotModelItem, 'id' | 'registeredRobotCount' | 'createdAt' | 'updatedAt'> & {
    id?: number
}
