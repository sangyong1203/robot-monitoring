export type MapType = 'INDOOR' | 'OUTDOOR'

export type MapItem = {
    id: number
    code: string
    name: string
    mapType: MapType
    orgName: string
    regionName: string
    zoneName: string
    fileName: string
    fileSize: number
    imageUrl: string
    width: number
    height: number
    resolution: number
    originX: number
    originY: number
    origin_x: number
    origin_y: number
    isPrimary: boolean
    isActive: boolean
    description?: string
    linkedRobotCount: number
    linkedDestinationCount: number
    registeredByName: string
    createdAt: string
    updatedAt: string
}

export type MapQuery = {
    keyword?: string
    mapType?: MapType
    isActive?: boolean
}

export type SaveMapPayload = Omit<MapItem, 'id' | 'linkedRobotCount' | 'linkedDestinationCount' | 'createdAt' | 'updatedAt'> & {
    id?: number
}
