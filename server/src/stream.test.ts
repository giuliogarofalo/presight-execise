import request from 'supertest'
import express from 'express'
import { faker } from '@faker-js/faker'

jest.mock('@faker-js/faker', () => ({
  faker: {
    lorem: {
      paragraphs: () => 'Test paragraph 1.\nTest paragraph 2.\nTest paragraph 3.'
    }
  }
}))

describe('Streaming Text API', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    
    app.get('/api/stream-text', (req, res) => {
      const text = faker.lorem.paragraphs(32)
      let index = 0

      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Transfer-Encoding', 'chunked')

      const streamChar = () => {
        if (index < text.length) {
          res.write(text[index])
          index++
          setTimeout(streamChar, 10)
        } else {
          res.end()
        }
      }

      streamChar()
    })
  })

  it('should stream text character by character', (done) => {
    let receivedText = ''

    request(app)
      .get('/api/stream-text')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.text).toBe('Test paragraph 1.\nTest paragraph 2.\nTest paragraph 3.')
        done()
      })
  })

  it('should set correct headers', async () => {
    const response = await request(app)
      .get('/api/stream-text')
      .expect(200)

    expect(response.headers['content-type']).toBe('text/plain')
    expect(response.headers['transfer-encoding']).toBe('chunked')
  })
})
