import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import usePayments from '../../hooks/usePayments'
import { formatCurrency, formatDate } from '../../utils/format'

export default function EditPayment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPaymentById, updatePayment, fetchPaymentsBySale } = usePayments()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Prior payments for the sale excluding the current payment
  const [priorPayments, setPriorPayments] = useState([])
  const [fetchingPrior, setFetchingPrior] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getPaymentById(id)
        setPayment(p)

        // Load other payments for the same sale
        if (p?.sale_id) {
          setFetchingPrior(true)
          const allPayments = await fetchPaymentsBySale(p.sale_id)
          // filter out the current payment
          setPriorPayments(allPayments.filter((item) => item.id !== id))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, getPaymentById, fetchPaymentsBySale])

  // Financial status for this invoice
  const finances = useMemo(() => {
    if (!payment || !payment.sales) return null
    const total = Number(payment.sales.total_amount || 0)
    const paidOthers = priorPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const remaining = Math.max(0, total - paidOthers)
    return { total, paidOthers, remaining }
  }, [payment, priorPayments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payAmount = Number(payment.amount || 0)
    if (isNaN(payAmount) || payAmount <= 0) {
      setError('Payment amount must be greater than zero.')
      setSaving(false)
      return
    }

    if (finances && payAmount > finances.remaining + 0.01) {
      setError(`Payment cannot exceed outstanding due of ${formatCurrency(finances.remaining)} (excluding other transactions).`)
      setSaving(false)
      return
    }

    // Duplicate check on other payments
    const isDuplicate = priorPayments.some(
      (p) =>
        Number(p.amount) === payAmount &&
        (p.payment_date || '').startsWith(payment.payment_date?.slice(0, 10)) &&
        (p.payment_method || '').toLowerCase() === (payment.payment_method || 'Cash').toLowerCase()
    )
    if (isDuplicate) {
      setError('A duplicate payment with this exact amount, date, and method already exists for this invoice.')
      setSaving(false)
      return
    }

    try {
      const updateData = {
        amount: payAmount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method || 'Cash',
        note: payment.note,
      }
      await updatePayment(id, updateData)
      navigate(`/payments/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Card className="p-6">Loading...</Card>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Payments</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Edit payment receipt</h1>
        <p className="mt-2 text-sm text-slate-600">Modify payment parameters for Invoice #{payment?.sales?.invoice_number}.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Receipt Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice number</label>
            <Input value={payment?.sales?.invoice_number || ''} disabled className="bg-slate-100 cursor-not-allowed font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (INR)</label>
            <Input
              type="number"
              step="0.01"
              value={payment.amount}
              onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
              max={finances ? finances.remaining : undefined}
              required
            />
            {finances && (
              <p className="mt-1.5 text-xs text-slate-500">
                Maximum allowed: <span className="font-semibold text-slate-800">{formatCurrency(finances.remaining)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment date</label>
            <Input
              type="date"
              value={payment.payment_date?.slice(0, 10) || ''}
              onChange={(e) => setPayment({ ...payment, payment_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={payment.payment_method || 'Cash'}
              onChange={(e) => setPayment({ ...payment, payment_method: e.target.value })}
              className="w-full rounded-2xl border border-slate-355 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 border-slate-300"
              required
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Note (Optional)</label>
            <Input
              value={payment.note || ''}
              onChange={(e) => setPayment({ ...payment, note: e.target.value })}
              placeholder="e.g. Received via UPI / Cash"
            />
          </div>

          {error && <p className="text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`/payments/${id}`)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </Card>

        {/* Invoice Finance Summary and Payment History */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Invoice Financials</h3>
            {finances ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Invoice Amount</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(finances.total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Other Payments Paid</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(finances.paidOthers)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold bg-slate-900 text-white px-3 py-3 rounded-2xl">
                  <span>Remaining Due</span>
                  <span>{formatCurrency(finances.remaining)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">Invoice financials not available.</p>
            )}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Other Transaction Receipts</h3>
            {fetchingPrior ? (
              <p className="text-sm text-slate-400 py-4 text-center">Loading ledger history...</p>
            ) : priorPayments.length > 0 ? (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {priorPayments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-sm border-l-4 border-slate-400 pl-3 py-2 bg-slate-50 rounded-r-xl pr-3">
                    <div>
                      <p className="font-semibold text-slate-800">{formatCurrency(p.amount)}</p>
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
      </form>
    </div>
  )
}
