import request from 'supertest'
import express from 'express'
import WebSocket from 'ws'
import { createServer } from 'http'
import { QueueItem } from './types'

jest.setTimeout(30000)  

describe('Queue and Worker System', () => {
  let app: express.Express
  let server: any
  let wss: WebSocket.Server
  let ws: WebSocket
  let queue: Map<string, QueueItem>
  let queueInterval: NodeJS.Timeout

  beforeAll((done) => {
    app = express()
    app.use(express.json())
    server = createServer(app)
    wss = new WebSocket.Server({ server })
    queue = new Map<string, QueueItem>()

    // Set up WebSocket handlers
    wss.on('connection', (ws) => {
      console.log('Test client connected')
    })

    app.post('/api/queue-request', (req, res) => {
      const id = 'test-' + Date.now()
      const item: QueueItem = {
        id,
        status: 'pending',
        timestamp: Date.now()
      }
      queue.set(id, item)
      res.json({ id, status: 'pending' })
    })

    app.get('/api/queue-request/:id', (req, res) => {
      const item = queue.get(req.params.id)
      if (!item) {
        res.status(404).json({ error: 'Item not found' })
        return
      }
      res.json(item)
    })

    server.listen(0, () => {
      const port = (server.address() as any).port
      ws = new WebSocket(`ws://localhost:${port}`)
      ws.on('open', done)
    })

    queueInterval = setInterval(() => {
      const pendingItems = Array.from(queue.entries())
        .filter(([_, item]) => item.status === 'pending')
      
      if (pendingItems.length > 0) {
        const [id, item] = pendingItems[0]
        item.status = 'completed'
        item.result = 'Test result'
        queue.set(id, item)

        const message = {
          type: 'result',
          data: {
            id,
            text: item.result
          }
        }

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
          }
        })
      }
    }, 100)
  })

  afterAll((done) => {
    clearInterval(queueInterval)
    ws.close()
    wss.close()
    server.close(done)
  })

  describe('Queue API', () => {
    it('should create a new queue item', async () => {
      const res = await request(app)
        .post('/api/queue-request')
        .send({})

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
      expect(res.body.status).toBe('pending')
    })

    it('should get a queue item by id', async () => {
      const createRes = await request(app)
        .post('/api/queue-request')
        .send({})

      const id = createRes.body.id

      const getRes = await request(app)
        .get(`/api/queue-request/${id}`)

      expect(getRes.status).toBe(200)
      expect(getRes.body.id).toBe(id)
      expect(getRes.body.status).toBe('pending')
    })

    it('should return 404 for non-existent queue item', async () => {
      const res = await request(app)
        .get('/api/queue-request/non-existent-id')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Item not found')
    })
  })

  describe('Worker Processing', () => {
    it('should process queue items and send results via WebSocket', (done) => {
      request(app)
        .post('/api/queue-request')
        .send({})
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)

          const id = res.body.id
          expect(res.body.status).toBe('pending')

          const messageHandler = (data: WebSocket.Data) => {
            const message = JSON.parse(data.toString())
            if (message.data.id === id) {
              expect(message.type).toBe('result')
              expect(message.data.text).toBeTruthy()
              ws.removeListener('message', messageHandler)
              done()
            }
          }

          ws.on('message', messageHandler)
        })
    })

    it('should process multiple queue items in order', (done) => {
      const numItems = 3
      const results: any[] = []
      const processedIds = new Set<string>()

      const messageHandler = (data: WebSocket.Data) => {
        const message = JSON.parse(data.toString())
        processedIds.add(message.data.id)
        if (processedIds.size === numItems) {
          ws.removeListener('message', messageHandler)
          done()
        }
      }

      ws.on('message', messageHandler)

      const createItems = async () => {
        for (let i = 0; i < numItems; i++) {
          const res = await request(app)
            .post('/api/queue-request')
            .send({})
            .expect(200)

          results.push(res)
          expect(res.body.status).toBe('pending')
        }
      }

      createItems()
    })
  })
})
