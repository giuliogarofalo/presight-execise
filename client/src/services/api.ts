const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  endpoints: {
    users: '/users',
    streamText: '/stream-text',
    queueRequest: '/queue-request',
    queueStatus: '/queue-status'
  }
} as const

type StreamCallback = (chunk: string) => void

function createApiUrl(endpoint: string, params?: Record<string, string>): string {
  const url = `${API_CONFIG.baseUrl}${endpoint}`
  if (!params) return url
  const searchParams = new URLSearchParams(params)
  return `${url}?${searchParams}`
}

async function* readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  } finally {
    reader.releaseLock()
  }
}

async function getStreamReader(endpoint: string) {
  const response = await fetch(createApiUrl(endpoint))
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No reader available')
  return reader
}

interface QueueResponse {
  id: string
  status: 'pending' | 'completed'
  result?: string
  timestamp?: number
}

export const api = {
  queue: {
    create: async (): Promise<QueueResponse> => {
      const response = await fetch(createApiUrl(API_CONFIG.endpoints.queueRequest), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.json()
    },
    get: async (id: string): Promise<QueueResponse> => {
      const response = await fetch(`${createApiUrl(API_CONFIG.endpoints.queueRequest)}/${id}`)
      return response.json()
    },
    status: async (id: string): Promise<QueueResponse> => {
      const response = await fetch(`${createApiUrl(API_CONFIG.endpoints.queueStatus)}/${id}`)
      return response.json()
    }
  },
  users: {
    list: async (params: Record<string, string>) => {
      const response = await fetch(createApiUrl(API_CONFIG.endpoints.users, params))
      return response.json()
    }
  },
  stream: {
    text: {
      subscribe: async (onChunk: StreamCallback) => {
        const reader = await getStreamReader(API_CONFIG.endpoints.streamText)
        let text = ''
        for await (const chunk of readStream(reader)) {
          text += chunk
          onChunk(text)
        }
        return text
      },
      getReader: () => getStreamReader(API_CONFIG.endpoints.streamText)
    }
  }
}
