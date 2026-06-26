import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  Users,
  DollarSign,
  CreditCard,
  FileText,
  Menu,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', to: '/inventory', icon: Box },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Sales', to: '/sales', icon: DollarSign },
  { label: 'Payments', to: '/payments', icon: CreditCard },
  { label: 'Expenses', to: '/expenses', icon: FileText },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose, onToggle }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-transform duration-300 md:sticky md:translate-x-0 ${
        isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-20'
      } overflow-hidden h-screen`}
    >
      <div className="flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold">SM</div>
          {isOpen && (
            <div>
              <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">Sri Mahalakshmi</p>
              <p className="text-xs text-slate-500">Admin Portal</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label="Close sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="mt-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose()
                }
              }}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
