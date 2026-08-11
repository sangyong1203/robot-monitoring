import { fetchApi } from '@/http'
import type { RobotControlLog, AutoControlSchedule } from './robotControl.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export const mockLogs: RobotControlLog[] = [
    {
        id: 101,
        robotId: 1,
        robotName: '무인지게차 1호기',
        commandType: 'MOVE_TO',
        payloadSummary: '목적지: 무인지게차 팰릿 상차지점 A (X: 12.5m, Y: 8.2m)',
        requestedBy: '운영자 (operator)',
        requestedAt: '2026-08-11 09:10:00',
        status: 'APPLIED',
    },
    {
        id: 102,
        robotId: 2,
        robotName: '저상형 AMR 1호기',
        commandType: 'START_MISSION',
        payloadSummary: '미션: [융합] 폐기물 이송 및 처분용기 자동 장입 복합 미션',
        requestedBy: '운영자 (operator)',
        requestedAt: '2026-08-11 09:15:00',
        status: 'APPLIED',
    },
    {
        id: 103,
        robotId: 6,
        robotName: '4족 보행 로봇 1호기 (Spot)',
        commandType: 'EXECUTE_TASK',
        payloadSummary: 'Task: 외곽 험지 침입 감시 순찰 Task',
        requestedBy: '운영자 (operator)',
        requestedAt: '2026-08-11 10:00:00',
        status: 'APPLIED',
    },
]

export const mockSchedules: AutoControlSchedule[] = [
    {
        id: 1,
        name: '주간 정기 시설물 순찰 스케줄',
        targetType: 'MISSION',
        missionId: 1,
        missionName: '외곽 험지 순찰 미션',
        robotId: 6,
        robotName: '4족 보행 로봇 1호기 (Spot)',
        cycleType: 'DAILY',
        cronExpression: '매일 09:00',
        repeatType: 'PERMANENT',
        repeatCondition: '매일 09:00 영구 반복',
        eventCodeId: 1,
        eventCodeName: 'EVT-PATROL-01 (외곽 순찰 시 작동)',
        status: 'ACTIVE',
        lastRunAt: '2026-08-10 09:00:00',
        nextRunAt: '2026-08-11 09:00:00',
    },
    {
        id: 2,
        name: 'AMR 2시간 간격 하역 및 이송 스케줄',
        targetType: 'TASK',
        taskId: 1,
        taskName: 'AMR 1호기 연속 운반 Task',
        robotId: 2,
        robotName: '저상형 AMR 1호기',
        cycleType: 'HOURLY',
        cronExpression: '매 2시간 마다',
        repeatType: 'PERMANENT',
        repeatCondition: '매 2시간 마다 영구 반복',
        eventCodeId: 2,
        eventCodeName: 'EVT-TRANSPORT-01 (팰릿 도착 시)',
        status: 'ACTIVE',
        lastRunAt: '2026-08-11 12:00:00',
        nextRunAt: '2026-08-11 14:00:00',
    },
]

export const getControlLogs = async () => {
    if (API_MODE === 'mock') return { data: mockLogs }
    return fetchApi().get<RobotControlLog[]>('/api/v1/robots/control/logs')
}

export const getControlSchedules = async () => {
    if (API_MODE === 'mock') return { data: mockSchedules }
    return fetchApi().get<AutoControlSchedule[]>('/api/v1/robots/control/schedules')
}
