import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { User } from '../types'

interface FetchUsersResponse {
  data: User[]
  nextPage: number
  totalPages: number
}

interface UseUsersProps {
  searchTerm: string
  hobbies: string[]
  nationalities: string[]
  limit?: number
}

async function fetchUsers(
  page: number,
  { searchTerm, hobbies, nationalities, limit = 12 }: UseUsersProps
): Promise<FetchUsersResponse> {
  const response = await api.users.list({
    page: String(page),
    limit: String(limit),
    search: searchTerm,
    hobbies: hobbies.join(','),
    nationalities: nationalities.join(',')
  })

  return {
    data: response.data,
    nextPage: response.page + 1,
    totalPages: response.totalPages
  }
}

export function useUsers(props: UseUsersProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['users', props.searchTerm, props.hobbies, props.nationalities],
    queryFn: ({ pageParam }) => fetchUsers(pageParam, props),
    getNextPageParam: (lastPage) => 
      lastPage.nextPage <= lastPage.totalPages ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  })

  const users = data?.pages.flatMap(page => page.data) ?? []

  return {
    users,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  }
}
