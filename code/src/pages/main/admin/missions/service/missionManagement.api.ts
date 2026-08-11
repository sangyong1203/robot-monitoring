import { fetchApi } from '@/http'
import type { ActivityItem, TaskItem, MissionItem } from './missionManagement.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export const mockActivities: ActivityItem[] = [
    {
        id: 1,
        name: '폐기물 팰릿 상차',
        code: 'ACT-PICK-PALLET-01',
        activityType: 'PICK',
        description: '무인지게차 폐기물 팰릿 상차 작업',
        createdAt: '2026-08-01 10:00:00',
    },
    {
        id: 2,
        name: 'AMR 팰릿 하차 및 교대',
        code: 'ACT-PLACE-AMR-01',
        activityType: 'PLACE',
        description: '무인지게차 AMR 1호기 상면 하차',
        createdAt: '2026-08-01 10:05:00',
    },
    {
        id: 3,
        name: '처분용기 앞 이동',
        code: 'ACT-MOVE-DISPOSAL-01',
        activityType: 'MOVE',
        description: 'AMR 1호기 처분용기 전면 이동',
        createdAt: '2026-08-01 10:10:00',
    },
    {
        id: 4,
        name: '드럼 처분용기 정밀 장입',
        code: 'ACT-INSERT-DRUM-01',
        activityType: 'PLACE',
        description: '산업용 로봇 팰릿 위 드럼 장입',
        createdAt: '2026-08-01 10:15:00',
    },
    {
        id: 5,
        name: '외곽 험지 순찰',
        code: 'ACT-PATROL-SURVEILLANCE-01',
        activityType: 'INSPECT',
        description: '4족 보행 로봇 외곽 험지 감시',
        createdAt: '2026-08-01 10:20:00',
    },
]

export const mockTasks: TaskItem[] = [
    {
        id: 1,
        name: '지게차 팰릿 적재 Task',
        code: 'TASK-FORKLIFT-LOAD-01',
        robotModelId: 1,
        robotModelName: '무인지게차',
        activities: [
            { sequence: 1, activityId: 1, activityName: '폐기물 팰릿 상차', destinationName: '폐기물 보관소 A' },
            { sequence: 2, activityId: 2, activityName: 'AMR 팰릿 하차 및 교대', destinationName: 'AMR 대기구간 1' },
        ],
        description: '무인지게차 팰릿 상차 및 AMR 하차 Task',
        createdAt: '2026-08-01 11:00:00',
    },
    {
        id: 2,
        name: 'AMR 1호기 연속 운반 Task',
        code: 'TASK-AMR1-TRANSPORT-01',
        robotModelId: 2,
        robotModelName: '저상형 AMR',
        activities: [
            { sequence: 1, activityId: 3, activityName: '처분용기 앞 이동', destinationName: '처분용기 장입구' },
        ],
        description: 'AMR 1호기 처분용기 운반 Task',
        createdAt: '2026-08-01 11:05:00',
    },
    {
        id: 3,
        name: '산업용 로봇 드럼 장입 Task',
        code: 'TASK-ROBOT-INSERT-01',
        robotModelId: 4,
        robotModelName: '산업용 로봇',
        activities: [
            { sequence: 1, activityId: 4, activityName: '드럼 처분용기 정밀 장입', destinationName: '장입셀 #1' },
        ],
        description: '산업용 로봇 드럼 정밀 장입 Task',
        createdAt: '2026-08-01 11:10:00',
    },
]

export const mockMissions: MissionItem[] = [
    {
        id: 1,
        name: '[융합] 폐기물 이송 및 처분용기 자동 장입 복합 미션',
        code: 'MIS-FUSED-WASTE-01',
        missionType: 'CONVERGENCE',
        description: '무인지게차, AMR 2대, 산업용 로봇이 연계 조건으로 교대 수행하는 융합 미션 시나리오',
        tasks: [
            { sequence: 1, taskId: 1, taskName: '지게차 팰릿 적재 Task', robotName: '무인지게차 1호기' },
            { sequence: 2, taskId: 2, taskName: 'AMR 1호기 연속 운반 Task', robotName: '저상형 AMR 1호기' },
            { sequence: 3, taskId: 3, taskName: '산업용 로봇 드럼 장입 Task', robotName: '산업용 장입 로봇 1호기' },
        ],
        conditions: [
            {
                precedingTaskId: 1,
                precedingTaskName: '지게차 팰릿 적재 Task',
                requiredStatus: 'COMPLETED',
                triggerTaskId: 2,
                triggerTaskName: 'AMR 1호기 연속 운반 Task',
            },
            {
                precedingTaskId: 2,
                precedingTaskName: 'AMR 1호기 연속 운반 Task',
                requiredStatus: 'COMPLETED',
                triggerTaskId: 3,
                triggerTaskName: '산업용 로봇 드럼 장입 Task',
            },
        ],
        status: 'ACTIVE',
        createdAt: '2026-08-02 09:00:00',
    },
]

export const getActivities = async () => {
    if (API_MODE === 'mock') return { data: mockActivities }
    return fetchApi().get<ActivityItem[]>('/api/v1/missions/activities')
}

export const getTasks = async () => {
    if (API_MODE === 'mock') return { data: mockTasks }
    return fetchApi().get<TaskItem[]>('/api/v1/missions/tasks')
}

export const getMissions = async () => {
    if (API_MODE === 'mock') return { data: mockMissions }
    return fetchApi().get<MissionItem[]>('/api/v1/missions')
}
