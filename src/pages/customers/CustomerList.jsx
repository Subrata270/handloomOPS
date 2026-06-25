import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Plus, Search, Trash2, Eye } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ConfirmModal from '../../components/ui/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'

export default function CustomerList() {
  const { customers, loading, error, loadCustomers, removeCustomer } = useCustomers()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = query.toLowerCase()
      return (
        customer.full_name?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search)
      )
    })
  }, [customers, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Customer management</h1>
          <p className="mt-2 text-sm text-slate-600">Track customer profiles, purchase preferences and order history with confidence.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/customers/add">
            <Button>
              <Plus size={16} /> Add customer
            </Button>
          </Link>
        </div>
      </div>

      <Card className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Input
          label="Search by name or phone"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find customers quickly"
          icon={<Search className="h-4 w-4 text-slate-400" />}
        />
      </Card>

      <Card>
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-600">{error}</div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Add customer records to begin tracking purchase preferences and history."
            action={<Link to="/customers/add"><Button>Add first customer</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Preference</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{customer.full_name}</td>
                    <td className="px-5 py-4">{customer.phone}</td>
                    <td className="px-5 py-4">{customer.email || '—'}</td>
                    <td className="px-5 py-4">{customer.purchase_preference || 'General'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye size={14} /> View
                        </Link>
                        <Link
                          to={`/customers/edit/${customer.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit3 size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(customer)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete customer"
        description={pendingDelete ? `Are you sure you want to permanently delete ${pendingDelete.full_name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await removeCustomer(pendingDelete.id)
            setPendingDelete(null)
          }
        }}
      />
    </div>
  )
}
