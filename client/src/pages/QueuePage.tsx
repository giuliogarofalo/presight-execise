import TaskItem from '../components/TaskItem'
import { useWebSocketQueue } from '../hooks/useWebSocketQueue'
import { CompletionMessage } from '../components/CompletionMessage'

export default function QueuePage() {
  const { tasks, allCompleted } = useWebSocketQueue()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <CompletionMessage show={allCompleted} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">WebSocket Queue</h1>
      <div className="bg-white shadow rounded-lg">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
