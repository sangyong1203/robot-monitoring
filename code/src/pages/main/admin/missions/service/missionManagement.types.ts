export type ActivityType = 'MOVE' | 'PICK' | 'PLACE' | 'INSPECT' | 'WAIT' | 'CHARGE'

export type ActivityItem = {
    id: number
    name: string
    code: string
    activityType: ActivityType
    targetRobotModelId?: number
    description?: string
    createdAt: string
}

export type TaskItem = {
    id: number
    name: string
    code: string
    robotModelId: number
    robotModelName: string
    activities: {
        sequence: number
        activityId: number
        activityName: string
        destinationName?: string
    }[]
    description?: string
    createdAt: string
}

export type MissionCondition = {
    precedingTaskId: number
    precedingTaskName: string
    requiredStatus: 'COMPLETED' | 'RUNNING'
    triggerTaskId: number
    triggerTaskName: string
}

export type MissionItem = {
    id: number
    name: string
    code: string
    missionType: 'SINGLE' | 'CONVERGENCE' // Single robot vs Multi-robot fused mission
    description?: string
    tasks: {
        sequence: number
        taskId: number
        taskName: string
        robotName: string
    }[]
    conditions: MissionCondition[]
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
}
