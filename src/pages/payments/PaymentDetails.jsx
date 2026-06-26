import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, CreditCard, Receipt, User, HelpCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmModal from '../../components/ui/ConfirmModal'
import usePayments from '../../hooks/usePayments'
import { formatCurrency, formatDate } from '../../utils/format'
import { supabase } from '../../services/supabaseClient'

export default function PaymentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPaymentById, deletePayment, fetchPaymentsBySale } = usePayments()
  const [payment, setPayment] = useState(null)
  const [customerName, setCustomerName] = useState('—')
  const [priorPayments, setPriorPayments] = useState([])
  const [finances, setFinances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const p = await getPaymentById(id)
        setPayment(p)

        if (p?.sales?.customer_id) {
          const { data: custData } = await supabase
            .from('customers')
            .select('full_name')
            .eq('id', p.sales.customer_id)
            .single()
          if (custData) {
            setCustomerName(custData.full_name)
          }
        }

        if (p?.sale_id) {
          const allPayments = await fetchPaymentsBySale(p.sale_id)
          setPriorPayments(allPayments || [])

          const total = Number(p.sales?.total_amount || 0)
          const paid = (allPayments || []).reduce((sum, payItem) => sum + Number(payItem.amount || 0), 0)
          const remaining = Math.max(0, total - paid)
          setFinances({ total, paid, remaining })
        }
      } catch (err) {
        console.error('Error loading payment details', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, getPaymentById, fetchPaymentsBySale])

  const handleDelete = async () => {
    if (payment?.sale_id) {
      await deletePayment(id)
      navigate('/payments')
    }
  }

  if (loading) return <Card className="p-6">Loading...</Card>
  if (!payment) return <Card className="p-6 text-rose-600">Payment record not found</Card>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Payments</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Payment Receipt</h1>
          <p className="mt-2 text-sm text-slate-650">Detailed verification of payment receipt and remaining due.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/payments">
            <Button variant="secondary"><ArrowLeft size={14} /> Back to list</Button>
          </Link>
          <Link to={`/payments/edit/${id}`}>
            <Button variant="secondary"><Edit size={14} /> Edit receipt</Button>
          </Link>
          <Button onClick={() => setConfirmOpen(true)} className="bg-rose-600 hover:bg-rose-700">
            <Trash2 size={14} /> Delete payment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Receipt details */}
        <Card className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 border-b pb-2">Receipt Details</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5"><Receipt size={14} /> Invoice Number</p>
              <p className="mt-1.5 font-bold text-slate-900">{payment.sales?.invoice_number || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5"><User size={14} /> Customer Name</p>
              <p className="mt-1.5 font-bold text-slate-900 capitalize">{customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5"><Calendar size={14} /> Payment Date</p>
              <p className="mt-1.5 text-slate-900 font-medium">{formatDate(payment.payment_date || payment.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5"><CreditCard size={14} /> Payment Method</p>
              <p className="mt-1.5 text-slate-900 font-medium">{payment.payment_method || 'Cash'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">Amount Received</p>
              <p className="mt-1.5 text-xl font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">Invoice Status</p>
              <div className="mt-1.5">
                <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${
                  payment.sales?.payment_status?.toLowerCase() === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : payment.sales?.payment_status?.toLowerCase() === 'partial'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {payment.sales?.payment_status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5"><HelpCircle size={14} /> Notes / Remarks</p>
            <p className="mt-2 text-slate-900 bg-slate-50 border rounded-2xl px-4 py-3 leading-relaxed text-sm">
              {payment.note || 'No custom notes recorded for this transaction.'}
            </p>
          </div>
        </Card>

        {/* Ledger Summary and History */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Invoice Financials</h3>
            {finances && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Invoice Amount</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(finances.total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Amount Paid</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(finances.paid)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold bg-slate-900 text-white px-3 py-3 rounded-2xl">
                  <span>Remaining Due</span>
                  <span>{formatCurrency(finances.remaining)}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Payment Ledger History</h3>
            {priorPayments.length > 0 ? (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {priorPayments.map((p) => (
                  <div key={p.id} className={`flex justify-between items-center text-sm border-l-4 pl-3 py-2 bg-slate-50 rounded-r-xl pr-3 ${
                    p.id === id ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-400'
                  }`}>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(p.amount)} {p.id === id && <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded-full ml-1.5">Current</span>}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(p.payment_date)} • <span className="font-medium text-slate-650">{p.payment_method || 'Cash'}</span></p>
                    </div>
                    {p.note && <span className="text-xs text-slate-600 max-w-[120px] truncate bg-white border px-2 py-0.5 rounded-full">{p.note}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No other payments logged for this invoice.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmModal open={confirmOpen} title="Delete payment" description="Are you sure you want to permanently delete this payment transaction? The invoice remaining balance and status will be updated immediately." onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
