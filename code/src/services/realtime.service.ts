import { fetchApi } from '@/http'

export type RealtimeMessageType = 'SNAPSHOT' | 'DELTA' | 'HEARTBEAT'
export type RealtimeConnectionState = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'

export type RealtimeEnvelope<T = unknown> = {
    version: '1'
    type: RealtimeMessageType
    eventId: string
    streamId: string
    sequence: number
    occurredAt: string
    data: T
}

export type RealtimeSnapshot = {
    robots: unknown[]
    generatedAt?: string
}

export type RealtimeClientOptions = {
    onSnapshot: (snapshot: RealtimeSnapshot) => void
    onDelta: (delta: unknown) => void
    onConnectionState?: (state: RealtimeConnectionState) => void
    onError?: (error: unknown) => void
}

type TicketResponse = {
    ticket: string
    expiresAt: string
}

const MAX_RECONNECT_DELAY_MS = 30_000

export class RealtimeClient {
    private socket: WebSocket | null = null
    private reconnectTimer: ReturnType<typeof window.setTimeout> | null = null
    private reconnectAttempt = 0
    private lastSequence = 0
    private stopped = true

    constructor(private readonly options: RealtimeClientOptions) {}

    start(): void {
        if (!this.stopped) {
            return
        }
        this.stopped = false
        void this.connect()
    }

    stop(): void {
        this.stopped = true
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        this.socket?.close(1000, 'Client stopped.')
        this.socket = null
        this.lastSequence = 0
        this.options.onConnectionState?.('DISCONNECTED')
    }

    private async connect(): Promise<void> {
        this.options.onConnectionState?.(this.reconnectAttempt > 0 ? 'RECONNECTING' : 'CONNECTING')
        try {
            const ticketResponse = await fetchApi().post<TicketResponse>('/api/v1/realtime/tickets')
            const ticket = ticketResponse.data?.ticket
            if (!ticket) {
                throw new Error('Realtime connection ticket was not issued.')
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const socketUrl = `${protocol}//${window.location.host}/api/v1/realtime/ws?ticket=${encodeURIComponent(ticket)}`
            const socket = new WebSocket(socketUrl)
            this.socket = socket

            socket.onopen = () => {
                this.reconnectAttempt = 0
                this.lastSequence = 0
                this.options.onConnectionState?.('CONNECTED')
            }
            socket.onmessage = event => {
                void this.handleMessage(event.data)
            }
            socket.onerror = event => {
                this.options.onError?.(event)
            }
            socket.onclose = () => {
                this.socket = null
                if (!this.stopped) {
                    this.scheduleReconnect()
                }
            }
        } catch (error) {
            this.options.onError?.(error)
            if (!this.stopped) {
                this.scheduleReconnect()
            }
        }
    }

    private async handleMessage(rawMessage: string): Promise<void> {
        try {
            const message = JSON.parse(rawMessage) as RealtimeEnvelope
            if (message.version !== '1' || !Number.isInteger(message.sequence)) {
                throw new Error('Unsupported realtime message.')
            }

            if (this.lastSequence > 0 && message.sequence !== this.lastSequence + 1) {
                await this.resynchronize()
            }
            this.lastSequence = message.sequence

            if (message.type === 'SNAPSHOT') {
                this.options.onSnapshot(message.data as RealtimeSnapshot)
            } else if (message.type === 'DELTA') {
                this.options.onDelta(message.data)
            }
        } catch (error) {
            this.options.onError?.(error)
        }
    }

    private async resynchronize(): Promise<void> {
        const response = await fetchApi().get<RealtimeSnapshot>('/api/v1/realtime/snapshot')
        if (response.data) {
            this.options.onSnapshot(response.data)
        }
    }

    private scheduleReconnect(): void {
        this.reconnectAttempt += 1
        const delay = Math.min(1000 * 2 ** (this.reconnectAttempt - 1), MAX_RECONNECT_DELAY_MS)
        this.options.onConnectionState?.('RECONNECTING')
        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null
            void this.connect()
        }, delay)
    }
}
