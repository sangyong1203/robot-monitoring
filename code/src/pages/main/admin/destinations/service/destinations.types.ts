export type DestinationType = 'WORK_SPOT' | 'CHARGING_STATION' | 'WAITING_SPOT' | 'PATROL_WAYPOINT' | 'STORAGE_AREA'

export type DestinationItem = {
    id: number
    mapId: number
    mapName: string
    name: string
    code: string
    type: DestinationType
    x: number
    y: number
    heading: number
    description?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type DestinationQuery = {
    mapId?: number
    keyword?: string
    type?: DestinationType
}

export type SaveDestinationPayload = Omit<DestinationItem, 'id' | 'mapName' | 'createdAt' | 'updatedAt'> & {
    id?: number
}
