import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  Users,
  DollarSign,
  CreditCard,
  FileText,
  Menu,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', to: '/inventory', icon: Box },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Sales', to: '/sales', icon: DollarSign },
  { label: 'Payments', to: '/payments', icon: CreditCard },
  { label: 'Expenses', to: '/expenses', icon: FileText },
]

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <aside className={`sticky top-0 z-20 h-screen border-r border-slate-200 bg-white transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'} overflow-hidden`}>
      <div className="flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">SM</div>
          {isOpen && (
            <div>
              <p className="text-sm font-semibold text-slate-900">Sri Mahalakshmi</p>
              <p className="text-xs text-slate-500">Admin Portal</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="mt-4 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
