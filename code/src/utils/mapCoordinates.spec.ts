import { describe, expect, it } from 'vitest'
import { isWorldPointWithinMap, pixelToWorld, worldToPixel, type MapMetadata } from './mapCoordinates'

const SAMPLE_MAP: MapMetadata = {
    width: 1856,
    height: 992,
    resolution: 0.05,
    origin_x: -46.4,
    origin_y: -24.8,
}

describe('map coordinate conversion', () => {
    it.each([
        [{ x: 3.3184643, y: 8.812156 }, { pixel_x: 994.369286, pixel_y: 319.75688 }],
        [{ x: 3.2883353, y: -8.611791 }, { pixel_x: 993.766706, pixel_y: 668.23582 }],
    ])('matches the sample_map golden coordinate', (world, expectedPixel) => {
        const pixel = worldToPixel(world, SAMPLE_MAP)

        expect(pixel.pixel_x).toBeCloseTo(expectedPixel.pixel_x, 6)
        expect(pixel.pixel_y).toBeCloseTo(expectedPixel.pixel_y, 6)
    })

    it('round-trips world and pixel coordinates', () => {
        const world = { x: 12.345, y: -4.567 }
        const roundTripped = pixelToWorld(worldToPixel(world, SAMPLE_MAP), SAMPLE_MAP)

        expect(roundTripped.x).toBeCloseTo(world.x, 10)
        expect(roundTripped.y).toBeCloseTo(world.y, 10)
    })

    it('allows observing outside points but identifies them as invalid control destinations', () => {
        expect(isWorldPointWithinMap({ x: 0, y: 0 }, SAMPLE_MAP)).toBe(true)
        expect(isWorldPointWithinMap({ x: 1000, y: 1000 }, SAMPLE_MAP)).toBe(false)
    })

    it('rejects invalid metadata', () => {
        expect(() => worldToPixel({ x: 0, y: 0 }, { ...SAMPLE_MAP, resolution: 0 })).toThrow()
    })
})
