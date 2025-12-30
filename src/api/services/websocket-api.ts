import apiClient from '../index'


const WS_ENDPOINT = '/ws/online'
const HEARTBEAT_MESSAGE = 'ping'
const HEARTBEAT_INTERVAL = 30_000
const RECONNECT_DELAY = 3_000
const MAX_RECONNECT_ATTEMPTS = 5

export interface OnlineStatusMessage {
  type?: string
  message?: string
  [key: string]: any
}

export interface OnlineStatusClientOptions {
  token?: string
  url?: string
  heartbeatInterval?: number
  maxReconnectAttempts?: number
  onConnected?: () => void
  onDisconnected?: () => void
  onReconnect?: (attempt: number) => void
  onMessage?: (data: OnlineStatusMessage) => void
  onError?: (event: Event) => void
}

type IntervalTimer = ReturnType<typeof setInterval> | null
type TimeoutTimer = ReturnType<typeof setTimeout> | null

const buildWsBase = () => {
  // 开发环境下使用配置的后端地址，生产环境下使用当前域名
  const isDev = import.meta.env.DEV
  if (isDev) {
    // 开发环境：使用配置的后端地址
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
    const url = new URL(backendUrl)
    const protocol = url.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${url.host}`
  } else {
    // 生产环境：使用当前域名
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${location.host}`
  }
}


const buildWsUrl = (token?: string, customUrl?: string) => {
  const base = customUrl ?? `${buildWsBase()}${WS_ENDPOINT}`
  if (!token) {
    return base
  }
  const connector = base.includes('?') ? '&' : '?'
  return `${base}${connector}token=${encodeURIComponent(token)}`
}

export class OnlineStatusClient {
  private ws: WebSocket | null = null
  private heartbeatTimer: IntervalTimer = null
  private reconnectTimer: TimeoutTimer = null
  private reconnectAttempts = 0
  private manualClose = false
  private readonly options: Required<Pick<OnlineStatusClientOptions, 'heartbeatInterval' | 'maxReconnectAttempts'>> &
    OnlineStatusClientOptions

  constructor(options: OnlineStatusClientOptions = {}) {
    this.options = {
      heartbeatInterval: options.heartbeatInterval ?? HEARTBEAT_INTERVAL,
      maxReconnectAttempts: options.maxReconnectAttempts ?? MAX_RECONNECT_ATTEMPTS,
      ...options,
    }
  }

  connect() {
    if (this.ws) {
      return
    }
    this.manualClose = false
    this.createSocket()
  }

  disconnect() {
    this.manualClose = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected() {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  private createSocket() {
    const token = this.options.token ?? localStorage.getItem('token') ?? ''
    const url = buildWsUrl(token, this.options.url)
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.options.onConnected?.()
    }

    this.ws.onmessage = (event) => {
      let payload: OnlineStatusMessage | string = event.data
      try {
        payload = JSON.parse(event.data)
      } catch {
        // 保留原始字符串
      }
      this.options.onMessage?.(payload as OnlineStatusMessage)
    }

    this.ws.onerror = (event) => {
      this.options.onError?.(event)
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.ws = null
      this.options.onDisconnected?.()
      if (!this.manualClose) {
        this.scheduleReconnect()
      }
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    if (!this.options.heartbeatInterval) return
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.ws?.send(HEARTBEAT_MESSAGE)
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return
    }
    this.reconnectAttempts += 1
    this.options.onReconnect?.(this.reconnectAttempts)
    this.reconnectTimer = setTimeout(() => {
      this.createSocket()
    }, RECONNECT_DELAY)
  }
}

const extractData = <T>(response: any, fallback: T): T => {
  return response?.data?.data ?? fallback
}

export const fetchOnlineCount = async (): Promise<number> => {
  const response = await apiClient.get('/api/online/count')
  const data = extractData<{ count?: number }>(response, {})
  return data.count ?? 0
}

export const fetchOnlineUserIds = async (): Promise<number[]> => {
  const response = await apiClient.get('/api/online/users')
  const data = extractData<{ onlineUserIds?: number[] }>(response, {})
  return data.onlineUserIds ?? []
}

export const checkUserOnline = async (userId: string | number): Promise<boolean> => {
  const response = await apiClient.get(`/api/online/check/${userId}`)
  const data = extractData<{ isOnline?: boolean }>(response, {})
  return Boolean(data.isOnline)
}

export const batchCheckUsersOnline = async (userIds: Array<string | number>): Promise<Record<string, boolean>> => {
  const response = await apiClient.post('/api/online/batch-check', userIds)
  return extractData<Record<string, boolean>>(response, {})
}
