import { describe, expect, it } from 'vitest'
import {
    isWorldPointWithinMap,
    pixelToWorld,
    worldToPixel,
    type MapMetadata,
} from '@/utils/mapCoordinates'

const SAMPLE_MAP: MapMetadata = {
    width: 1856,
    height: 992,
    resolution: 0.05,
    origin_x: -46.4,
    origin_y: -24.8,
}

describe('monitoring map coordinate contract', () => {
    it('keeps the approved metadata keys without camel-case origin aliases', () => {
        expect(Object.keys(SAMPLE_MAP).sort()).toEqual(
            ['height', 'origin_x', 'origin_y', 'resolution', 'width'].sort(),
        )
        expect('originX' in SAMPLE_MAP).toBe(false)
        expect('originY' in SAMPLE_MAP).toBe(false)
    })

    it.each([
        { world: { x: 3.3184643, y: 8.812156 }, pixel: { pixel_x: 994.369286, pixel_y: 319.75688 } },
        { world: { x: 3.2883353, y: -8.611791 }, pixel: { pixel_x: 993.766706, pixel_y: 668.23582 } },
        { world: { x: -46.4, y: -24.8 }, pixel: { pixel_x: 0, pixel_y: 992 } },
        { world: { x: 46.4, y: 24.8 }, pixel: { pixel_x: 1856, pixel_y: 0 } },
    ])('round-trips meter and pixel coordinates: $world', ({ world, pixel }) => {
        const converted = worldToPixel(world, SAMPLE_MAP)
        const roundTripped = pixelToWorld(converted, SAMPLE_MAP)

        expect(converted.pixel_x).toBeCloseTo(pixel.pixel_x, 6)
        expect(converted.pixel_y).toBeCloseTo(pixel.pixel_y, 6)
        expect(roundTripped.x).toBeCloseTo(world.x, 10)
        expect(roundTripped.y).toBeCloseTo(world.y, 10)
    })

    it('accepts exact map boundaries and rejects points beyond any edge', () => {
        expect(isWorldPointWithinMap({ x: -46.4, y: -24.8 }, SAMPLE_MAP)).toBe(true)
        expect(isWorldPointWithinMap({ x: 46.4, y: 24.8 }, SAMPLE_MAP)).toBe(true)
        expect(isWorldPointWithinMap({ x: -46.4001, y: 0 }, SAMPLE_MAP)).toBe(false)
        expect(isWorldPointWithinMap({ x: 46.4001, y: 0 }, SAMPLE_MAP)).toBe(false)
        expect(isWorldPointWithinMap({ x: 0, y: -24.8001 }, SAMPLE_MAP)).toBe(false)
        expect(isWorldPointWithinMap({ x: 0, y: 24.8001 }, SAMPLE_MAP)).toBe(false)
    })
})
