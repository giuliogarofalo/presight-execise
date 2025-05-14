import request from 'supertest'
import express from 'express'
import { generateUsers } from './data'
import { User } from './types'

jest.mock('./data', () => ({
  generateUsers: () => [
    {
      avatar: 'avatar1.jpg',
      first_name: 'John',
      last_name: 'Doe',
      age: 30,
      nationality: 'USA',
      hobbies: ['Reading', 'Gaming']
    },
    {
      avatar: 'avatar2.jpg',
      first_name: 'Jane',
      last_name: 'Smith',
      age: 25,
      nationality: 'Italian',
      hobbies: ['Cooking', 'Traveling']
    },
    {
      avatar: 'avatar3.jpg',
      first_name: 'Mario',
      last_name: 'Rossi',
      age: 35,
      nationality: 'Italian',
      hobbies: ['Gaming', 'Music']
    }
  ] as User[]
}))

const app = express()
app.use(express.json())

app.get('/api/users', (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const search = (req.query.search as string) || ''
  const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {}

  const users = generateUsers(3)
  let filteredUsers = users

  if (search) {
    const searchTerms = search.toLowerCase().split(' ')
    filteredUsers = filteredUsers.filter(user => {
      const fullName = `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`
      return searchTerms.every(term => fullName.includes(term))
    })
  }

  if (filter.nationality) {
    filteredUsers = filteredUsers.filter(user =>
      user.nationality === filter.nationality
    )
  }

  if (filter.hobbies) {
    filteredUsers = filteredUsers.filter(user =>
      filter.hobbies.every((hobby: string) => user.hobbies.includes(hobby))
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
    limit,
    totalPages
  })
})

describe('Users API', () => {
  describe('Pagination', () => {
    it('should return paginated results with default values', async () => {
      const res = await request(app).get('/api/users')
      expect(res.status).toBe(200)
      expect(res.body.page).toBe(1)
      expect(res.body.limit).toBe(10)
      expect(res.body.total).toBe(3)
      expect(res.body.data).toHaveLength(3)
    })

    it('should return correct page with custom limit', async () => {
      const res = await request(app).get('/api/users?page=1&limit=2')
      expect(res.status).toBe(200)
      expect(res.body.page).toBe(1)
      expect(res.body.limit).toBe(2)
      expect(res.body.total).toBe(3)
      expect(res.body.data).toHaveLength(2)
    })
  })

  describe('Filtering', () => {
    it('should filter by nationality', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ filter: JSON.stringify({ nationality: 'Italian' }) })
      
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(2)
      expect(res.body.data.every((user: User) => user.nationality === 'Italian')).toBe(true)
    })

    it('should filter by hobbies', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ filter: JSON.stringify({ hobbies: ['Gaming'] }) })
      
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(2)
      expect(res.body.data.every((user: User) => user.hobbies.includes('Gaming'))).toBe(true)
    })
  })

  describe('Search', () => {
    it('should search by first name', async () => {
      const res = await request(app).get('/api/users?search=john')
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
      expect(res.body.data[0].first_name).toBe('John')
    })

    it('should search by last name', async () => {
      const res = await request(app).get('/api/users?search=smith')
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
      expect(res.body.data[0].last_name).toBe('Smith')
    })

    it('should search across first and last name', async () => {
      const res = await request(app).get('/api/users?search=mario rossi')
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
      expect(res.body.data[0].first_name).toBe('Mario')
      expect(res.body.data[0].last_name).toBe('Rossi')
    })
  })

  describe('Combined Filtering', () => {
    it('should combine search with nationality filter', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({
          search: 'mario',
          filter: JSON.stringify({ nationality: 'Italian' })
        })
      
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
      expect(res.body.data[0].first_name).toBe('Mario')
      expect(res.body.data[0].nationality).toBe('Italian')
    })

    it('should combine pagination with filters', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({
          page: '1',
          limit: '1',
          filter: JSON.stringify({ nationality: 'Italian' })
        })
      
      expect(res.status).toBe(200)
      expect(res.body.page).toBe(1)
      expect(res.body.limit).toBe(1)
      expect(res.body.total).toBe(2)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].nationality).toBe('Italian')
    })
  })
})
