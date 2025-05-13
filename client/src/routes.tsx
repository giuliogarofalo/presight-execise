import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import StreamPage from './pages/StreamPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <StreamPage />
      }
    ]
  }
])
