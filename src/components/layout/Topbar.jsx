import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

const pageLabels = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  add: 'Add Product',
  edit: 'Edit Product',
  customers: 'Customers',
  sales: 'Sales',
  invoice: 'Invoice',
  details: 'Customer Details',
}

export default function Topbar({ onToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const currentPage = useMemo(() => {
    const segment = location.pathname.split('/')[1] || 'dashboard'
    return pageLabels[segment] || 'Admin Panel'
  }, [location.pathname])

  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 sm:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm font-medium text-slate-500">Welcome back</p>
            <h1 className="text-xl font-semibold text-slate-900">{currentPage}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
