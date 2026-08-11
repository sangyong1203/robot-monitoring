export type ControlMode = 'AUTO' | 'MANUAL' | 'PAUSED'

export type ControlExecutionUnit = 'DESTINATION' | 'ACTIVITY' | 'TASK' | 'MISSION' | 'SET_MODE' | 'E_STOP'

export type RobotControlLog = {
    id: number
    robotId: number
    robotName: string
    commandType: string
    payloadSummary: string
    requestedBy: string
    requestedAt: string
    status: 'ACCEPTED' | 'APPLIED' | 'REJECTED'
}

export type AutoControlSchedule = {
    id: number
    name: string
    targetType: 'TASK' | 'MISSION'
    missionId?: number
    missionName?: string
    taskId?: number
    taskName?: string
    robotId: number
    robotName: string
    cycleType: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY'
    cronExpression: string
    repeatType: 'PERMANENT' | 'COUNT'
    repeatCount?: number
    repeatCondition: string
    eventCodeId?: number
    eventCodeName?: string
    status: 'ACTIVE' | 'PAUSED'
    lastRunAt: string | null
    nextRunAt: string | null
}
