import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="text-xl font-bold">Presight</div>
      </header>
      <main className="py-10">
        <Outlet />
      </main>
    </div>
  )
}
