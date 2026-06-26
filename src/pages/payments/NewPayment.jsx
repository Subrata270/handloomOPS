import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import usePayments from '../../hooks/usePayments'
import { fetchSales } from '../../services/salesService'
import { formatCurrency, formatDate } from '../../utils/format'

export default function NewPayment() {
  const navigate = useNavigate()
  const { createPayment, fetchPaymentsBySale } = usePayments()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [sales, setSales] = useState([])
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Invoice calculations
  const [selectedSale, setSelectedSale] = useState(null)
  const [priorPayments, setPriorPayments] = useState([])
  const [fetchingPrior, setFetchingPrior] = useState(false)

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await fetchSales()
        setSales(data || [])
      } catch (err) {
        setError(err.message || 'Unable to load invoices')
      }
    }

    loadSales()
  }, [])

  // React to invoice number selection
  useEffect(() => {
    const sale = sales.find((s) => s.invoice_number === invoiceNumber)
    setSelectedSale(sale || null)
    setPriorPayments([])
    setAmount('')
    setError(null)

    if (sale) {
      setFetchingPrior(true)
      fetchPaymentsBySale(sale.id)
        .then((p) => setPriorPayments(p || []))
        .catch((err) => console.error('Error fetching prior payments', err))
        .finally(() => setFetchingPrior(false))
    }
  }, [invoiceNumber, sales, fetchPaymentsBySale])

  // Financial status for selected invoice
  const finances = useMemo(() => {
    if (!selectedSale) return null
    const total = Number(selectedSale.total_amount || 0)
    const paid = priorPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const remaining = Math.max(0, total - paid)
    return { total, paid, remaining }
  }, [selectedSale, priorPayments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!selectedSale) {
      setError('Please select a valid invoice number.')
      return
    }

    const payAmount = Number(amount || 0)
    if (isNaN(payAmount) || payAmount <= 0) {
      setError('Payment amount must be greater than zero.')
      return
    }

    if (finances && payAmount > finances.remaining + 0.01) {
      setError(`Payment cannot exceed outstanding due of ${formatCurrency(finances.remaining)}.`)
      return
    }

    // Duplicate transaction check
    const isDuplicate = priorPayments.some(
      (p) =>
        Number(p.amount) === payAmount &&
        (p.payment_date || '').startsWith(paymentDate) &&
        (p.payment_method || '').toLowerCase() === paymentMethod.toLowerCase()
    )
    if (isDuplicate) {
      setError('A duplicate payment with this exact amount, date, and method already exists.')
      return
    }

    setLoading(true)
    try {
      const payment = {
        sale_id: selectedSale.id,
        amount: payAmount,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        note,
      }
      const created = await createPayment(payment)
      navigate(`/payments/${created.id}`)
    } catch (err) {
      setError(err.message || 'Unable to save payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Payments</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Record payment</h1>
        <p className="mt-2 text-sm text-slate-600">Register customer payments and update invoice outstanding balances.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Receipt Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice number</label>
            <select
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full rounded-2xl border border-slate-355 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 border-slate-300"
              required
            >
              <option value="">Select an invoice number</option>
              {sales.map((sale) => (
                <option key={sale.id} value={sale.invoice_number}>
                  {sale.invoice_number} ({sale.payment_status || 'Pending'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (INR)</label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
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
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
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
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received via GPay / Cash"
            />
          </div>

          {error && <p className="text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">{error}</p>}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading || !invoiceNumber}>
              {loading ? 'Saving...' : 'Save payment'}
            </Button>
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
                  <span className="text-slate-500">Total Amount Paid</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(finances.paid)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold bg-slate-900 text-white px-3 py-3 rounded-2xl">
                  <span>Remaining Due</span>
                  <span>{formatCurrency(finances.remaining)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">Select an invoice to view financial status.</p>
            )}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Payment Ledger</h3>
            {fetchingPrior ? (
              <p className="text-sm text-slate-400 py-4 text-center">Loading ledger history...</p>
            ) : priorPayments.length > 0 ? (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {priorPayments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-sm border-l-4 border-slate-900 pl-3 py-2 bg-slate-50 rounded-r-xl pr-3">
                    <div>
                      <p className="font-semibold text-slate-800">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-slate-500">{formatDate(p.payment_date)} • <span className="font-medium text-slate-600">{p.payment_method || 'Cash'}</span></p>
                    </div>
                    {p.note && <span className="text-xs text-slate-650 max-w-[120px] truncate bg-white border px-2 py-0.5 rounded-full">{p.note}</span>}
                  </div>
                ))}
              </div>
            ) : selectedSale ? (
              <p className="text-sm text-slate-500 py-4 text-center">No prior payments logged for this invoice.</p>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">Select an invoice to load ledger.</p>
            )}
          </Card>
        </div>
      </form>
    </div>
  )
}
