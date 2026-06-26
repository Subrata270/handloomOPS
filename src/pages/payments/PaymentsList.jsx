import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit, Eye } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import usePayments from '../../hooks/usePayments'
import { fetchCustomers } from '../../services/customerService'
import { formatCurrency, formatDate } from '../../utils/format'

export default function PaymentsList() {
  const { payments, loading, loadPayments, deletePayment } = usePayments()
  const [customers, setCustomers] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [currentDelete, setCurrentDelete] = useState(null)

  useEffect(() => {
    loadPayments()
    fetchCustomers()
      .then((data) => setCustomers(data || []))
      .catch((err) => console.error('Error fetching customers in payments list', err))
  }, [loadPayments])

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c.full_name])),
    [customers],
  )

  const handleDelete = async () => {
    if (!currentDelete) return
    await deletePayment(currentDelete)
    setConfirmOpen(false)
    setCurrentDelete(null)
    loadPayments()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Payments</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Payments Ledger</h1>
          <p className="mt-2 text-sm text-slate-600">Track and record payments collected from customers against invoices.</p>
        </div>
        <div>
          <Link to="/payments/new">
            <Button><Plus size={14} /> Record payment</Button>
          </Link>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : payments.length === 0 ? (
          <EmptyState title="No payments recorded" description="Start registering payments received from customers." action={<Link to="/payments/new"><Button>Record payment</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-4">Invoice #</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4 text-right">Amount Paid</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4">Invoice Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-950">{p.sales?.invoice_number || '—'}</td>
                    <td className="px-5 py-4 capitalize">{customerMap[p.sales?.customer_id] || '—'}</td>
                    <td className="px-5 py-4 text-right text-emerald-600 font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-4">{formatDate(p.payment_date || p.created_at)}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{p.payment_method || 'Cash'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.sales?.payment_status?.toLowerCase() === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.sales?.payment_status?.toLowerCase() === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.sales?.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/payments/${p.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"> <Eye size={13} /> View</Link>
                        <Link to={`/payments/edit/${p.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"> <Edit size={13} /> Edit</Link>
                        <button onClick={() => { setCurrentDelete(p.id); setConfirmOpen(true) }} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-750 hover:bg-rose-100"> <Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmModal open={confirmOpen} title="Delete payment receipt" description="Are you sure you want to permanently delete this payment transaction? The invoice remaining balance and status will be updated immediately." onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
