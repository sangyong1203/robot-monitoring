import { describe, expect, it } from 'vitest'
import { hasScreenPermission } from './screenAccess'

describe('screenAccess stub', () => {
    it('always permits access', () => {
        expect(hasScreenPermission()).toBe(true)
    })
})
