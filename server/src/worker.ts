import { parentPort } from 'worker_threads'
import { faker } from '@faker-js/faker'

if (parentPort) {
  parentPort.on('message', (requestId: string) => {
    setTimeout(() => {
      const result = {
        id: requestId,
        text: faker.lorem.paragraphs(3)
      }
      parentPort?.postMessage(result)
    }, 2000)
  })
}
