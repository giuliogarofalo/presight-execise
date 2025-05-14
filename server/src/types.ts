export interface User {
  id: string
  first_name: string
  last_name: string
  age: number
  nationality: string
  hobbies: string[]
  avatar: string
}

export interface QueueItem {
  id: string
  status: 'pending' | 'completed'
  result?: string
  timestamp: number
}

export interface WorkerMessage {
  id: string
  text: string
}

export interface WebSocketMessage {
  type: 'result'
  data: WorkerMessage
}

export interface QueueRequest {
  id: string
  status: 'pending' | 'completed'
  result?: string
}
