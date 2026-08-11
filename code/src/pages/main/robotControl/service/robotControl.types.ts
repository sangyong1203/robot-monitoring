export type ControlMode = 'AUTO' | 'MANUAL' | 'PAUSED'

export type RobotControlLog = {
    id: number
    robotId: number
    robotName: string
    commandType: 'MOVE_TO' | 'SET_MODE' | 'START_MISSION' | 'SAFE_STOP' | 'E_STOP'
    payloadSummary: string
    requestedBy: string
    requestedAt: string
    status: 'ACCEPTED' | 'APPLIED' | 'REJECTED'
}

export type AutoControlSchedule = {
    id: number
    name: string
    missionId: number
    missionName: string
    robotId: number
    robotName: string
    cronExpression: string
    repeatCondition: string
    status: 'ACTIVE' | 'PAUSED'
    lastRunAt: string | null
    nextRunAt: string | null
}
