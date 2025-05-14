import { useState, useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import SearchBox from '../components/SearchBox'
import UserList from '../components/UserList'
import Sidebar from '../components/Sidebar'
import FilterSection from '../components/FilterSection'
import { useUsers } from '../hooks/useUsers'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([])
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([])
  const parentRef = useRef<HTMLDivElement>(null)

  const {
    users,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    status
  } = useUsers({
    searchTerm,
    hobbies: selectedHobbies,
    nationalities: selectedNationalities,
    limit: 12
  })

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? users.length + 1 : users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, 
    overscan: 5,
    paddingStart: 16, 
    paddingEnd: 16,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]

    if (!lastItem) return

    if (
      lastItem.index >= users.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    hasNextPage,
    fetchNextPage,
    users.length,
    isFetchingNextPage,
    virtualItems,
    rowVirtualizer
  ])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleHobbiesChange = (hobbies: string[]) => {
    setSelectedHobbies(hobbies)
  }

  const handleNationalitiesChange = (nationalities: string[]) => {
    setSelectedNationalities(nationalities)
  }

  const filters = {
    hobbies: Array.from(
      new Set(users.flatMap(user => user.hobbies))
    ).map(label => ({
      label,
      count: users.filter(user => user.hobbies.includes(label)).length
    })).sort((a, b) => a.label.localeCompare(b.label)),
    nationalities: Array.from(
      new Set(users.map(user => user.nationality))
    ).map(label => ({
      label,
      count: users.filter(user => user.nationality === label).length
    })).sort((a, b) => a.label.localeCompare(b.label))
  }

  return (
    <div className="h-full flex">
      <Sidebar>
        <div>
          <SearchBox onSearch={handleSearch} />
        </div>

        {filters.hobbies.length > 0 && (
          <FilterSection
            title="Hobbies"
            items={filters.hobbies}
            selectedItems={selectedHobbies}
            onChange={handleHobbiesChange}
            type="badge"
          />
        )}
        {filters.nationalities.length > 0 && (
          <FilterSection
            title="Nationalities"
            items={filters.nationalities}
            selectedItems={selectedNationalities}
            onChange={handleNationalitiesChange}
          />
        )}
      </Sidebar>

      <main className="flex-1 p-8 overflow-auto" ref={parentRef}>
        {status === 'pending' ? (
          <p>Loading...</p>
        ) : status === 'error' ? (
          <p>Error fetching users</p>
        ) : (
          <>
            <UserList 
              users={users}
              virtualItems={virtualItems}
              totalSize={rowVirtualizer.getTotalSize()}
              onLoadMore={fetchNextPage}
            />
            <div className="mt-4 text-center text-sm text-gray-500">
              {isFetching && !isFetchingNextPage ? 'Refreshing...' : null}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
