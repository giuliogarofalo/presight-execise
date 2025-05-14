import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { faker } from '@faker-js/faker'
import cors from 'cors'
import { generateUsers } from './data'
import { User } from './types'
import { WebSocketServer, WebSocket } from 'ws'
import { QueueItem, WebSocketMessage } from './types'

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

const wss = new WebSocketServer({ server })
const queue = new Map<string, QueueItem>()

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected')

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

app.post('/api/queue-request', (req: Request, res: Response) => {
  const id = faker.string.uuid()
  const item: QueueItem = {
    id,
    status: 'pending',
    timestamp: Date.now()
  }
  
  queue.set(id, item)
  console.log(`Created new task: ${id}`)
  res.json({ id, status: 'pending' })

  if (queue.size >= 1) {
    processNextItem()
  }
})

app.get('/api/queue-request/:id', (req: Request, res: Response) => {
  const item = queue.get(req.params.id)
  if (!item) {
    res.status(404).json({ error: 'Item not found' })
    return
  }
  res.json(item)
})

let isProcessing = false

const processNextItem = () => {
  if (isProcessing) return
  
  const pendingItems = Array.from(queue.entries()).filter(([_, item]) => item.status === 'pending')
  if (pendingItems.length === 0) {
    isProcessing = false
    return
  }

  isProcessing = true
  const randomIndex = Math.floor(Math.random() * pendingItems.length)
  const [id, item] = pendingItems[randomIndex]
  
  console.log(`Completing task ${id}`)
  item.status = 'completed'
  const generatedText = faker.lorem.paragraphs(3)
  item.result = generatedText
  
  const wsMessage: WebSocketMessage = {
    type: 'result',
    data: {
      id,
      text: item.result
    }
  }

  const messageStr = JSON.stringify(wsMessage)

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr)
    }
  })

  const delay = Math.random() * 2000 + 1000
  setTimeout(() => {
    isProcessing = false
    processNextItem()
  }, delay)
}

processNextItem()

app.get('/api/stream-text', (_req: Request, res: Response) => {
  const text = faker.lorem.paragraphs(32)
  let index = 0

  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Transfer-Encoding', 'chunked')

  const streamChar = () => {
    if (index < text.length) {
      res.write(text[index])
      index++
      setTimeout(streamChar, 500)
    } else {
      res.end()
    }
  }

  streamChar()
})

const users: User[] = generateUsers(100)

app.get('/api/users', (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const search = (req.query.search as string)?.toLowerCase() || ''
  const hobbies = (req.query.hobbies as string)?.split(',').filter(Boolean) || []
  const nationalities = (req.query.nationalities as string)?.split(',').filter(Boolean) || []

  let filteredUsers = [...users]

  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search)
    )
  }

  if (hobbies.length > 0) {
    filteredUsers = filteredUsers.filter(user =>
      hobbies.every(hobby => user.hobbies.includes(hobby))
    )
  }

  if (nationalities.length > 0) {
    filteredUsers = filteredUsers.filter(user =>
      nationalities.includes(user.nationality)
    )
  }

  const filters = filteredUsers.reduce(
    (acc, user) => {
      user.hobbies.forEach((hobby: string) => {
        acc.hobbies.set(hobby, (acc.hobbies.get(hobby) || 0) + 1)
      })
      
      acc.nationalities.set(
        user.nationality,
        (acc.nationalities.get(user.nationality) || 0) + 1
      )
      
      return acc
    },
    {
      hobbies: new Map<string, number>(),
      nationalities: new Map<string, number>()
    }
  )

  const totalUsers = filteredUsers.length
  const totalPages = Math.ceil(totalUsers / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  res.json({
    data: paginatedUsers,
    filters: {
      hobbies: Array.from(filters.hobbies.entries()).map(([label, count]) => ({ label, count })),
      nationalities: Array.from(filters.nationalities.entries()).map(([label, count]) => ({ label, count }))
    },
    total: totalUsers,
    page,
    totalPages
  })
})

server.listen(3000, () => {
  console.log('Server running on port 3000')
  isProcessing = false
})  
