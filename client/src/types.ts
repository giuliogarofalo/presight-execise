export interface User {
  id: string
  first_name: string
  last_name: string
  age: number
  nationality: string
  hobbies: string[]
  avatar: string
}

export interface UsersResponse {
  data: User[]
  total: number
  page: number
  totalPages: number
}
