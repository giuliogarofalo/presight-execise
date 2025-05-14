import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import UsersPage from './pages/UsersPage'
import StreamPage from './pages/StreamPage'
import QueuePage from './pages/QueuePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <UsersPage />
      },
      {
        path: 'stream',
        element: <StreamPage />
      },
      {
        path: 'queue',
        element: <QueuePage />
      }
    ]
  }
])
