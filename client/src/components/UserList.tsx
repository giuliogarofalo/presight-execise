import { VirtualItem } from '@tanstack/react-virtual'
import { User } from '../types'
import UserCard from './UserCard'

interface UserListProps {
  users: User[]
  virtualItems: VirtualItem[]
  totalSize: number
  onLoadMore?: () => void
}

export default function UserList({ users, virtualItems, totalSize, onLoadMore }: UserListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        </div>
      </div>

      <div 
        className="h-[calc(100vh-12rem)] overflow-auto px-4"
        onScroll={(e) => {
          const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
          if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            onLoadMore?.()
          }
        }}
      >
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{
            height: `${totalSize}px`,
            position: 'relative'
          }}
        >
          {virtualItems.map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <UserCard user={users[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
