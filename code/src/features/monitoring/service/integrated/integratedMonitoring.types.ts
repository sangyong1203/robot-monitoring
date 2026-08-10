export type ControlMap = {
    id: number
    name: string
    code?: string
    mapType?: string
    version?: string | number
    width: number
    height: number
    imageUrl?: string
    imagePath?: string
    resolution: number
    originX?: number
    originY?: number
    origin_x: number
    origin_y: number
    [key: string]: any
}

export type RobotRegistration = {
    id: number
    code?: string
    name: string
    robotType: 'WORK' | 'SURVEILLANCE'
    robotModelId?: number
    modelCode?: string
    modelName?: string
    batteryPercent: number
    x: number
    y: number
    heading: number
    status?: string
    lastSeenAt?: string | null
    [key: string]: any
}

export type CommunicationStatus = 'ONLINE' | 'STALE' | 'OFFLINE'

export type MonitoringRobot = RobotRegistration & {
    mapId: number
    communicationStatus: CommunicationStatus
}

export type MonitoringMap = ControlMap & {
    robots: MonitoringRobot[]
}

export type MonitoringCounts = {
    total: number
    online: number
    stale: number
    offline: number
    work: number
    surveillance: number
}

export type IntegratedMonitoringSnapshot = {
    generatedAt: string
    counts: MonitoringCounts
    maps: MonitoringMap[]
    robots: MonitoringRobot[]
}
