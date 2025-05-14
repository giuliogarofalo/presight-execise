import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Task, TaskStatus } from '../components/TaskItem'

interface QueueResponse {
  id: string
  status: 'pending' | 'completed'
}

interface WebSocketMessage {
  type: 'result'
  data: {
    id: string
    text: string
  }
}

export function useWebSocketQueue() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allCompleted, setAllCompleted] = useState(false)

  useEffect(() => {
    console.log('Creating WebSocket connection...')
    const ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      console.log('WebSocket connected')
      for (let i = 0; i < 20; i++) {
        api.queue.create()
          .then((data: QueueResponse) => {
            console.log('Created task:', data.id)
            setTasks(currentTasks => [...currentTasks, {
              id: data.id,
              status: 'pending',
              createdAt: new Date()
            }])
          })
          .catch(error => console.error('Error creating task:', error))
      }
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data)
      try {
        const message = JSON.parse(event.data) as WebSocketMessage
        if (message.type === 'result') {
          setTasks(currentTasks => {
            const updatedTasks = currentTasks.map(task => 
              task.id === message.data.id 
                ? { 
                    ...task, 
                    status: 'completed' as TaskStatus, 
                    result: message.data.text 
                  }
                : task
            )

            const allTasksCompleted = updatedTasks.every(task => task.status === 'completed')
            if (allTasksCompleted) {
              setAllCompleted(true)
            }
            
            return updatedTasks
          })
        }
      } catch (error) {
        console.error('Error processing message:', error)
      }
    }

    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      console.log('Cleaning up WebSocket connection')
      ws.close()
    }
  }, [])

  return { tasks, allCompleted }
}
