export type MapMetadata = {
    width: number
    height: number
    resolution: number
    origin_x: number
    origin_y: number
}

export type WorldPoint = {
    x: number
    y: number
}

export type PixelPoint = {
    pixel_x: number
    pixel_y: number
}

const validateMetadata = (metadata: MapMetadata): void => {
    if (metadata.width <= 0 || metadata.height <= 0 || metadata.resolution <= 0) {
        throw new Error('Map width, height, and resolution must be greater than zero.')
    }
}

export const worldToPixel = (point: WorldPoint, metadata: MapMetadata): PixelPoint => {
    validateMetadata(metadata)
    return {
        pixel_x: (point.x - metadata.origin_x) / metadata.resolution,
        pixel_y: metadata.height - (point.y - metadata.origin_y) / metadata.resolution,
    }
}

export const pixelToWorld = (point: PixelPoint, metadata: MapMetadata): WorldPoint => {
    validateMetadata(metadata)
    return {
        x: point.pixel_x * metadata.resolution + metadata.origin_x,
        y: (metadata.height - point.pixel_y) * metadata.resolution + metadata.origin_y,
    }
}

export const isWorldPointWithinMap = (point: WorldPoint, metadata: MapMetadata): boolean => {
    const pixel = worldToPixel(point, metadata)
    return pixel.pixel_x >= 0 && pixel.pixel_x <= metadata.width && pixel.pixel_y >= 0 && pixel.pixel_y <= metadata.height
}
