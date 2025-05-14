export type TaskStatus = 'pending' | 'completed' | 'failed'

export interface Task {
  id: string
  status: TaskStatus
  result?: string
  createdAt: Date
}

interface TaskItemProps {
  task: Task
}

export default function TaskItem({ task }: TaskItemProps) {
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className={`px-2 py-1 rounded-full text-sm ${statusColor[task.status]}`}>
            {task.status}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Task {task.id}</p>
          <p className="text-sm text-gray-500">
            Created at: {task.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
      {task.result && (
        <div className="text-sm text-gray-500">
          Result: {task.result}
        </div>
      )}
    </div>
  )
}
