export type StandardControlExecutionUnit = 'DESTINATION' | 'ACTIVITY' | 'TASK' | 'MISSION'

export interface RobotManualControlRobot {
    id: number
    name: string
    robotType: 'WORK' | 'SURVEILLANCE'
    status?: string
    communicationStatus: string
    batteryPercent: number
    x: number
    y: number
    siteX?: number
    siteY?: number
    heading?: number
    mapId?: number
}

export interface JogLogItem {
    id: number
    time: string
    action: string
    actionName: string
    speed: number
}
