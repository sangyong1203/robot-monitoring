import type { MonitoringRobot } from '@/features/monitoring/service/integrated/integratedMonitoring.types'

export type RobotTelemetryCallback = (robots: MonitoringRobot[]) => void

class SimulationService {
    private timer: ReturnType<typeof window.setInterval> | null = null
    private listeners: Set<RobotTelemetryCallback> = new Set()
    private robots: MonitoringRobot[] = [
        {
            id: 1,
            name: '무인지게차 1호기',
            robotType: 'WORK',
            mapId: 2,
            batteryPercent: 88,
            x: 12.5,
            y: 8.2,
            siteX: 16.0,
            siteY: 10.0,
            heading: 90,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
            lastSeenAt: new Date().toISOString(),
        },
        {
            id: 2,
            name: '저상형 AMR 1호기',
            robotType: 'WORK',
            mapId: 2,
            batteryPercent: 92,
            x: 18.0,
            y: 8.2,
            siteX: 24.0,
            siteY: 10.0,
            heading: 0,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
            lastSeenAt: new Date().toISOString(),
        },
        {
            id: 3,
            name: '저상형 AMR 2호기',
            robotType: 'WORK',
            mapId: 2,
            batteryPercent: 75,
            x: 5.0,
            y: 3.5,
            siteX: 8.0,
            siteY: 18.0,
            heading: 270,
            communicationStatus: 'ONLINE',
            status: 'IDLE',
            lastSeenAt: new Date().toISOString(),
        },
        {
            id: 4,
            name: '산업용 장입 로봇 1호기',
            robotType: 'WORK',
            mapId: 4,
            batteryPercent: 100,
            x: 25.4,
            y: 15.6,
            siteX: 78.0,
            siteY: 14.0,
            heading: 180,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
            lastSeenAt: new Date().toISOString(),
        },
        {
            id: 5,
            name: '편심 자율주행 로봇 1호기',
            robotType: 'SURVEILLANCE',
            mapId: 3,
            batteryPercent: 64,
            x: 32.0,
            y: 20.5,
            siteX: 32.0,
            siteY: 38.0,
            heading: 45,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
            lastSeenAt: new Date().toISOString(),
        },
        {
            id: 6,
            name: '4족 보행 로봇 1호기 (Spot)',
            robotType: 'SURVEILLANCE',
            mapId: 3,
            batteryPercent: 82,
            x: 45.0,
            y: 30.0,
            siteX: 60.0,
            siteY: 38.0,
            heading: 90,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
            lastSeenAt: new Date().toISOString(),
        },
        {
            id: 7,
            name: '실외 자율주행 로봇 1호기',
            robotType: 'SURVEILLANCE',
            mapId: 3,
            batteryPercent: 95,
            x: 60.0,
            y: 12.0,
            siteX: 88.0,
            siteY: 38.0,
            heading: 180,
            communicationStatus: 'ONLINE',
            status: 'RUNNING',
            lastSeenAt: new Date().toISOString(),
        },
    ]

    start(intervalMs = 1000): void {
        if (this.timer !== null) return

        this.timer = setInterval(() => {
            this.updateSimulatedRobots()
            this.notifyListeners()
        }, intervalMs)
    }

    stop(): void {
        if (this.timer !== null) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    subscribe(callback: RobotTelemetryCallback): () => void {
        this.listeners.add(callback)
        if (this.listeners.size === 1) {
            this.start(1000)
        }
        callback(this.getRobots())

        return () => {
            this.listeners.delete(callback)
            if (this.listeners.size === 0) {
                this.stop()
            }
        }
    }

    getRobots(): MonitoringRobot[] {
        return JSON.parse(JSON.stringify(this.robots))
    }

    private updateSimulatedRobots(): void {
        const now = new Date().toISOString()
        this.robots.forEach(robot => {
            if (robot.status === 'RUNNING') {
                const deltaX = (Math.random() - 0.48) * 0.6
                const deltaY = (Math.random() - 0.48) * 0.6
                robot.x = Math.max(1, Math.min(100, robot.x + deltaX))
                robot.y = Math.max(1, Math.min(60, robot.y + deltaY))

                if (robot.siteX !== undefined) {
                    robot.siteX = Math.max(1, Math.min(100, robot.siteX + deltaX))
                }
                if (robot.siteY !== undefined) {
                    robot.siteY = Math.max(1, Math.min(60, robot.siteY + deltaY))
                }

                robot.heading = Math.round((robot.heading + (Math.random() - 0.5) * 15 + 360) % 360)

                if (Math.random() < 0.05 && robot.batteryPercent > 5) {
                    robot.batteryPercent -= 1
                }
            }
            robot.lastSeenAt = now
        })
    }

    applyCommand(robotId: number, commandType: string, payload?: any): boolean {
        const robot = this.robots.find(r => r.id === robotId)
        if (!robot) return false

        if (commandType === 'MOVE_TO' && payload) {
            robot.x = payload.x ?? robot.x
            robot.y = payload.y ?? robot.y
            if (robot.siteX !== undefined) robot.siteX = payload.x ?? robot.siteX
            if (robot.siteY !== undefined) robot.siteY = payload.y ?? robot.siteY
            robot.status = 'RUNNING'
        } else if (commandType === 'SET_MODE' && payload) {
            if (payload.mode === 'PAUSED') robot.status = 'IDLE'
            else if (payload.mode === 'MANUAL' || payload.mode === 'AUTO') robot.status = 'RUNNING'
        } else if (commandType === 'SAFE_STOP' || commandType === 'E_STOP') {
            robot.status = 'ERROR'
            robot.communicationStatus = 'STALE'
        }

        this.notifyListeners()
        return true
    }

    private notifyListeners(): void {
        const currentRobots = this.getRobots()
        this.listeners.forEach(cb => cb(currentRobots))
    }
}

export const simulationService = new SimulationService()
