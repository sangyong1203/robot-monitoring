import { fetchApi } from '@/http'
import type { RobotControlLog, AutoControlSchedule } from './robotControl.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export const mockLogs: RobotControlLog[] = [
    {
        id: 101,
        robotId: 1,
        robotName: '무인지게차 1호기',
        commandType: 'MOVE_TO',
        payloadSummary: 'X: 12.5m, Y: 8.2m',
        requestedBy: '운영자 (operator)',
        requestedAt: '2026-08-11 09:10:00',
        status: 'APPLIED',
    },
    {
        id: 102,
        robotId: 2,
        robotName: '저상형 AMR 1호기',
        commandType: 'START_MISSION',
        payloadSummary: '미션 #1 [융합] 폐기물 이송 및 처분용기 장입',
        requestedBy: '운영자 (operator)',
        requestedAt: '2026-08-11 09:15:00',
        status: 'APPLIED',
    },
]

export const mockSchedules: AutoControlSchedule[] = [
    {
        id: 1,
        name: '주간 정기 시설물 순찰 스케줄',
        missionId: 1,
        missionName: '외곽 험지 순찰 미션',
        robotId: 6,
        robotName: '4족 보행 로봇 1호기 (Spot)',
        cronExpression: '0 0 09 * * ?',
        repeatCondition: '매일 오전 9시 반복',
        status: 'ACTIVE',
        lastRunAt: '2026-08-10 09:00:00',
        nextRunAt: '2026-08-11 09:00:00',
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
