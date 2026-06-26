import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen relative">
        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden"
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen((open) => !open)}
        />
        <div className="flex min-h-screen flex-1 flex-col w-full overflow-x-hidden">
          <Topbar isSidebarOpen={isSidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
