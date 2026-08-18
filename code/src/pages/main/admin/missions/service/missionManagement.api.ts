import { fetchApi } from '@/http'
import type { ActivityItem, TaskItem, MissionItem, ScheduleItem } from './missionManagement.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export const mockActivities: ActivityItem[] = [
    {
        id: 1,
        name: '폐기물 팰릿 상차',
        code: 'ACT-PICK-PALLET-01',
        activityType: 'PICK',
        destinationId: 1,
        destinationName: '무인지게차 팰릿 상차지점 A',
        description: '무인지게차 폐기물 팰릿 상차 작업',
        createdAt: '2026-08-01 10:00:00',
    },
    {
        id: 2,
        name: 'AMR 팰릿 하차 및 교대',
        code: 'ACT-PLACE-AMR-01',
        activityType: 'PLACE',
        destinationId: 2,
        destinationName: 'AMR 1호기 교대 대기위치',
        description: '무인지게차 AMR 1호기 상면 하차',
        createdAt: '2026-08-01 10:05:00',
    },
    {
        id: 3,
        name: '처분용기 앞 이동',
        code: 'ACT-MOVE-DISPOSAL-01',
        activityType: 'MOVE',
        destinationId: 3,
        destinationName: '산업용 로봇 드럼 정밀 장입위치',
        description: 'AMR 1호기 처분용기 전면 이동',
        createdAt: '2026-08-01 10:10:00',
    },
    {
        id: 4,
        name: '드럼 처분용기 정밀 장입',
        code: 'ACT-INSERT-DRUM-01',
        activityType: 'PLACE',
        destinationId: 3,
        destinationName: '산업용 로봇 드럼 정밀 장입위치',
        description: '산업용 로봇 팰릿 위 드럼 장입',
        createdAt: '2026-08-01 10:15:00',
    },
    {
        id: 5,
        name: '외곽 험지 순찰',
        code: 'ACT-PATROL-SURVEILLANCE-01',
        activityType: 'INSPECT',
        destinationId: 5,
        destinationName: '외곽 침입 감시 웨이포인트 #1',
        description: '4족 보행 로봇 외곽 험지 감시',
        createdAt: '2026-08-01 10:20:00',
    },
    {
        id: 6,
        name: '웨이포인트 열화상 스캔',
        code: 'ACT-THERMAL-SCAN-01',
        activityType: 'INSPECT',
        destinationId: 5,
        destinationName: '외곽 침입 감시 웨이포인트 #3',
        description: '외곽 험지 침입 감시를 위한 열화상 스캔',
        createdAt: '2026-08-01 10:25:00',
    },
    {
        id: 7,
        name: '상차 완료 대기',
        code: 'ACT-WAIT-PALLET-READY-01',
        activityType: 'WAIT',
        destinationId: 2,
        destinationName: 'AMR 2호기 교대 대기위치',
        description: '장입구역 다음 팰릿 교대를 위한 상차 완료 대기',
        createdAt: '2026-08-01 10:30:00',
    },
]

export const mockTasks: TaskItem[] = [
    {
        id: 1,
        name: '지게차 팰릿 적재 Task',
        code: 'TASK-FORKLIFT-LOAD-01',
        robotModelId: 1,
        robotModelName: '무인지게차',
        destinationId: 1,
        destinationName: '무인지게차 팰릿 상차지점 A',
        activities: [
            { sequence: 1, activityId: 1, activityName: '폐기물 팰릿 상차', destinationName: '무인지게차 팰릿 상차지점 A' },
            { sequence: 2, activityId: 2, activityName: 'AMR 팰릿 하차 및 교대', destinationName: 'AMR 1호기 교대 대기위치' },
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
        destinationId: 3,
        destinationName: '산업용 로봇 드럼 정밀 장입위치',
        activities: [
            { sequence: 1, activityId: 3, activityName: '처분용기 앞 이동', destinationName: '산업용 로봇 드럼 정밀 장입위치' },
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
        destinationId: 3,
        destinationName: '산업용 로봇 드럼 정밀 장입위치',
        activities: [
            { sequence: 1, activityId: 4, activityName: '드럼 처분용기 정밀 장입', destinationName: '산업용 로봇 드럼 정밀 장입위치' },
        ],
        description: '산업용 로봇 드럼 정밀 장입 Task',
        createdAt: '2026-08-01 11:10:00',
    },
    {
        id: 4,
        name: '외곽 험지 침입 감시 순찰 Task',
        code: 'TASK-SPOT-PATROL-01',
        robotModelId: 5,
        robotModelName: '4족 보행 로봇',
        destinationId: 5,
        destinationName: '외곽 침입 감시 웨이포인트 #3',
        activities: [
            { sequence: 1, activityId: 5, activityName: '외곽 험지 순찰', destinationName: '외곽 침입 감시 웨이포인트 #1' },
            { sequence: 2, activityId: 6, activityName: '웨이포인트 열화상 스캔', destinationName: '외곽 침입 감시 웨이포인트 #3' },
        ],
        description: '4족 보행 로봇 외곽 험지 침입 감시 순찰 Task',
        createdAt: '2026-08-01 11:15:00',
    },
    {
        id: 5,
        name: '장입구역 다음 팰릿 교대 준비 Task',
        code: 'TASK-AMR2-PALLET-STANDBY-01',
        robotModelId: 2,
        robotModelName: '저상형 AMR',
        destinationId: 2,
        destinationName: 'AMR 2호기 교대 대기위치',
        activities: [
            { sequence: 1, activityId: 7, activityName: '상차 완료 대기', destinationName: 'AMR 2호기 교대 대기위치' },
        ],
        description: '장입구역 다음 팰릿 교대를 위한 AMR 2호기 대기 Task',
        createdAt: '2026-08-01 11:20:00',
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
    {
        id: 2,
        name: '외곽 험지 침입 감시 순찰',
        code: 'MIS-SPOT-PATROL-01',
        missionType: 'SINGLE',
        description: '4족 보행 로봇 1호기가 외곽 험지 웨이포인트를 순찰하고 열화상 스캔을 수행하는 감시 미션',
        tasks: [{ sequence: 1, taskId: 4, taskName: '외곽 험지 침입 감시 순찰 Task', robotName: '4족 보행 로봇 1호기' }],
        conditions: [],
        status: 'ACTIVE',
        createdAt: '2026-08-02 09:10:00',
    },
    {
        id: 3,
        name: '장입구역 다음 팰릿 교대 준비',
        code: 'MIS-PALLET-STANDBY-01',
        missionType: 'SINGLE',
        description: 'AMR 2호기가 장입구역 다음 팰릿 교대 준비를 위해 상차 완료 상태를 대기하는 미션',
        tasks: [{ sequence: 1, taskId: 5, taskName: '장입구역 다음 팰릿 교대 준비 Task', robotName: 'AMR 2호기' }],
        conditions: [],
        status: 'ACTIVE',
        createdAt: '2026-08-02 09:20:00',
    },
]

export const mockSchedules: ScheduleItem[] = [
    {
        id: 1,
        code: 'SCHED-DAILY-01',
        name: '매일 오전 방사성 폐기물 자동 이송 및 장입 미션',
        missionId: 1,
        missionName: '[융합] 폐기물 이송 및 처분용기 자동 장입 복합 미션',
        robotId: 1,
        robotName: '무인지게차 1호기 (통합 제어)',
        cronExpression: '매일 09:00',
        scheduleType: 'DAILY',
        nextRunAt: '2026-08-12 09:00:00',
        isActive: true,
        createdAt: '2026-08-05 10:00:00',
    },
    {
        id: 2,
        code: 'SCHED-HOURLY-01',
        name: '2시간 간격 Spot 험지 순찰 스케줄',
        missionId: 2,
        missionName: '외곽 험지 침입 감시 순찰',
        robotId: 5,
        robotName: '4족 보행 로봇 1호기 (Spot)',
        cronExpression: '매 2시간 마다',
        scheduleType: 'HOURLY',
        nextRunAt: '2026-08-11 18:00:00',
        isActive: true,
        createdAt: '2026-08-06 14:00:00',
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

export const getSchedules = async () => {
    if (API_MODE === 'mock') return { data: mockSchedules }
    return fetchApi().get<ScheduleItem[]>('/api/v1/missions/schedules')
}
