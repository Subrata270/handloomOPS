import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmModal from '../../components/ui/ConfirmModal'
import usePayments from '../../hooks/usePayments'
import { formatCurrency, formatDate } from '../../utils/format'

export default function PaymentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPaymentById, deletePayment } = usePayments()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getPaymentById(id)
        setPayment(p)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, getPaymentById])

  const handleDelete = async () => {
    await deletePayment(id)
    navigate('/payments')
  }

  if (loading) return <Card className="p-6">Loading...</Card>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Payment</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Payment #{payment.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/payments">
            <Button variant="secondary"><ArrowLeft size={14} /> Back</Button>
          </Link>
          <Link to={`/payments/edit/${id}`}>
            <Button variant="secondary"><Edit size={14} /> Edit</Button>
          </Link>
          <Button onClick={() => setConfirmOpen(true)} className="bg-rose-600"><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <Card>
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-slate-500">Sale</p>
            <p className="mt-2 text-slate-900">{payment.sale_id || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Amount</p>
            <p className="mt-2 text-slate-900">{formatCurrency(payment.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Date</p>
            <p className="mt-2 text-slate-900">{formatDate(payment.payment_date || payment.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Note</p>
            <p className="mt-2 text-slate-900">{payment.note || '—'}</p>
          </div>
        </div>
      </Card>

      <ConfirmModal open={confirmOpen} title="Delete payment" description="Delete this payment?" onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
