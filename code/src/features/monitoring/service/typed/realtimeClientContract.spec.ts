import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RealtimeClient } from '@/services/realtime.service'

const apiMocks = vi.hoisted(() => ({
    post: vi.fn(),
    get: vi.fn(),
}))

vi.mock('@/http', () => ({
    fetchApi: () => ({
        post: apiMocks.post,
        get: apiMocks.get,
    }),
}))

class FakeWebSocket {
    static instances: FakeWebSocket[] = []

    onopen: (() => void) | null = null
    onmessage: ((event: { data: string }) => void) | null = null
    onerror: ((error: unknown) => void) | null = null
    onclose: (() => void) | null = null
    closed = false

    constructor(readonly url: string) {
        FakeWebSocket.instances.push(this)
    }

    close() {
        this.closed = true
    }

    open() {
        this.onopen?.()
    }

    message(value: unknown) {
        this.onmessage?.({ data: JSON.stringify(value) })
    }

    disconnect() {
        this.onclose?.()
    }
}

const flushPromises = async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
}

const envelope = (sequence: number, type: 'SNAPSHOT' | 'DELTA', data: unknown) => ({
    version: '1',
    type,
    eventId: `event-${sequence}`,
    streamId: 'stream-1',
    sequence,
    occurredAt: '2026-07-31T00:00:00Z',
    data,
})

describe('RealtimeClient contract', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        FakeWebSocket.instances = []
        apiMocks.post.mockReset()
        apiMocks.get.mockReset()
        apiMocks.post.mockResolvedValue({
            data: { ticket: 'ticket-1', expiresAt: '2026-07-31T00:00:30Z' },
        })
        apiMocks.get.mockResolvedValue({
            data: { robots: [{ id: 99 }], generatedAt: '2026-07-31T00:00:03Z' },
        })
        vi.stubGlobal('WebSocket', FakeWebSocket)
        vi.stubGlobal('window', {
            location: { protocol: 'http:', host: 'localhost:5173' },
            setTimeout,
            clearTimeout,
        })
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    it('requests a REST snapshot before applying a delta when sequence is missing', async () => {
        const onSnapshot = vi.fn()
        const onDelta = vi.fn()
        const client = new RealtimeClient({ onSnapshot, onDelta })

        client.start()
        await flushPromises()
        const socket = FakeWebSocket.instances[0]
        socket.open()
        socket.message(envelope(1, 'SNAPSHOT', { robots: [{ id: 1 }] }))
        await flushPromises()
        socket.message(envelope(3, 'DELTA', {
            robots: [{ id: 2 }],
            removedRobotIds: [],
            generatedAt: '2026-07-31T00:00:03Z',
        }))
        await flushPromises()

        expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/realtime/snapshot')
        expect(onSnapshot).toHaveBeenNthCalledWith(1, { robots: [{ id: 1 }] })
        expect(onSnapshot).toHaveBeenNthCalledWith(2, {
            robots: [{ id: 99 }],
            generatedAt: '2026-07-31T00:00:03Z',
        })
        expect(onDelta).toHaveBeenCalledTimes(1)
        client.stop()
    })

    it('reconnects with a new one-time ticket after the socket closes', async () => {
        const states: string[] = []
        const client = new RealtimeClient({
            onSnapshot: vi.fn(),
            onDelta: vi.fn(),
            onConnectionState: state => states.push(state),
        })

        client.start()
        await flushPromises()
        FakeWebSocket.instances[0].open()
        FakeWebSocket.instances[0].disconnect()

        expect(states).toContain('RECONNECTING')
        await vi.advanceTimersByTimeAsync(1000)
        await flushPromises()

        expect(apiMocks.post).toHaveBeenCalledTimes(2)
        expect(FakeWebSocket.instances).toHaveLength(2)
        client.stop()
        expect(states.at(-1)).toBe('DISCONNECTED')
    })
})
