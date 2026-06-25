import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar isSidebarOpen={isSidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
