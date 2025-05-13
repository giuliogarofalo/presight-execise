import { faker } from '@faker-js/faker'
import { User } from './types'

const HOBBIES = [
  'Reading',
  'Gaming',
  'Cooking',
  'Photography',
  'Traveling',
  'Painting',
  'Writing',
  'Music',
  'Dancing',
  'Gardening',
  'Sports',
  'Hiking',
  'Yoga',
  'Movies',
  'Chess'
]

const NATIONALITIES = [
  'American',
  'British',
  'Canadian',
  'German',
  'French',
  'Italian',
  'Spanish',
  'Japanese',
  'Chinese',
  'Australian'
]

export const generateUsers = (count: number): User[] => {
  const users: User[] = []

  for (let i = 0; i < count; i++) {
    const shuffledHobbies = [...HOBBIES].sort(() => Math.random() - 0.5)
    const hobbiesCount = faker.number.int({ min: 1, max: 5 })

    users.push({
      id: faker.string.uuid(),
      avatar: faker.image.avatar(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 100 }),
      nationality: NATIONALITIES[faker.number.int({ min: 0, max: NATIONALITIES.length - 1 })],
      hobbies: shuffledHobbies.slice(0, hobbiesCount)
    })
  }

  return users
}
