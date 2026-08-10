import { fetchApi } from '@/http'
import type { IntegratedMonitoringSnapshot } from './integratedMonitoring.types'

const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export const mockIntegratedSnapshot: IntegratedMonitoringSnapshot = {
    generatedAt: new Date().toISOString(),
    counts: {
        total: 7,
        online: 6,
        stale: 1,
        offline: 0,
        work: 4,
        surveillance: 3,
    },
    maps: [
        {
            id: 1,
            code: 'MAP-INDOOR-01',
            name: '처분용기 장입 실내 1층 도면',
            width: 1200,
            height: 800,
            imageUrl: '/sample_map/map.png',
            resolution: 0.05,
            origin_x: 0,
            origin_y: 0,
            robots: [],
        },
        {
            id: 2,
            code: 'MAP-OUTDOOR-01',
            name: '외곽 시설물 정밀 순찰 2D 지도',
            width: 1600,
            height: 1000,
            imageUrl: '/sample_map/map.png',
            resolution: 0.1,
            origin_x: 0,
            origin_y: 0,
            robots: [],
        },
    ],
    robots: [
        {
            id: 1,
            name: '무인지게차 1호기',
            robotType: 'WORK',
            mapId: 1,
            batteryPercent: 88,
            x: 12.5,
            y: 8.2,
            heading: 90,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
        },
        {
            id: 2,
            name: '저상형 AMR 1호기',
            robotType: 'WORK',
            mapId: 1,
            batteryPercent: 92,
            x: 18.0,
            y: 8.2,
            heading: 0,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
        },
        {
            id: 3,
            name: '저상형 AMR 2호기',
            robotType: 'WORK',
            mapId: 1,
            batteryPercent: 75,
            x: 5.0,
            y: 3.5,
            heading: 270,
            communicationStatus: 'ONLINE',
            status: 'IDLE',
        },
        {
            id: 4,
            name: '산업용 장입 로봇 1호기',
            robotType: 'WORK',
            mapId: 1,
            batteryPercent: 100,
            x: 25.4,
            y: 15.6,
            heading: 180,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
        },
        {
            id: 5,
            name: '편심 자율주행 로봇 1호기',
            robotType: 'SURVEILLANCE',
            mapId: 2,
            batteryPercent: 64,
            x: 32.0,
            y: 20.5,
            heading: 45,
            communicationStatus: 'STALE',
            status: 'RUNNING',
        },
        {
            id: 6,
            name: '4족 보행 로봇 1호기 (Spot)',
            robotType: 'SURVEILLANCE',
            mapId: 2,
            batteryPercent: 82,
            x: 45.0,
            y: 30.0,
            heading: 90,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
        },
        {
            id: 7,
            name: '실외 자율주행 로봇 1호기',
            robotType: 'SURVEILLANCE',
            mapId: 2,
            batteryPercent: 95,
            x: 60.0,
            y: 12.0,
            heading: 180,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
        },
    ],
}

export const getIntegratedMonitoring = async () => {
    if (API_MODE === 'mock') {
        return { data: mockIntegratedSnapshot, result: 'SUCCESS', resultMessage: '성공' }
    }
    try {
        return await fetchApi().get<IntegratedMonitoringSnapshot>('/api/v1/monitoring/integrated')
    } catch {
        return { data: mockIntegratedSnapshot, result: 'SUCCESS', resultMessage: '성공' }
    }
}
