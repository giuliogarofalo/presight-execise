import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { faker } from '@faker-js/faker'
import cors from 'cors'
import { generateUsers } from './data'
import { User } from './types'

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

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
})  
