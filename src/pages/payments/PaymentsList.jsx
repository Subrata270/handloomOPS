import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit, Eye } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmModal from '../../components/ui/ConfirmModal'
import usePayments from '../../hooks/usePayments'
import { formatCurrency, formatDate } from '../../utils/format'

export default function PaymentsList() {
  const { payments, loading, loadPayments, deletePayment } = usePayments()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [currentDelete, setCurrentDelete] = useState(null)

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
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Payments</h1>
        </div>
        <div>
          <Link to="/payments/new">
            <Button><Plus size={14} /> New payment</Button>
          </Link>
        </div>
      </div>

      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : payments.length === 0 ? (
          <EmptyState title="No payments" description="Record payments received from customers." action={<Link to="/payments/new"><Button>Record payment</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4">Invoice / Sale</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Note</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{p.sale_id || '—'}</td>
                    <td className="px-5 py-4">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-4">{formatDate(p.payment_date || p.created_at)}</td>
                    <td className="px-5 py-4">{p.note || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/payments/${p.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"> <Eye size={14} /> View</Link>
                        <Link to={`/payments/edit/${p.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"> <Edit size={14} /> Edit</Link>
                        <button onClick={() => { setCurrentDelete(p.id); setConfirmOpen(true) }} className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"> <Trash2 size={14} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmModal open={confirmOpen} title="Delete payment" description="Are you sure you want to delete this payment? This action cannot be undone." onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
