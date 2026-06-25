import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import usePayments from '../../hooks/usePayments'
import { fetchSales, getSaleByInvoiceNumber } from '../../services/salesService'

export default function NewPayment() {
  const navigate = useNavigate()
  const { createPayment } = usePayments()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [sales, setSales] = useState([])
  const [amount, setAmount] = useState(0)
  const [paymentDate, setPaymentDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  const invoiceNumbers = useMemo(
    () => sales.map((sale) => sale.invoice_number).filter(Boolean),
    [sales],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!invoiceNumber) {
      setError('Please enter or select an invoice number.')
      return
    }

    setLoading(true)
    try {
      const sale = await getSaleByInvoiceNumber(invoiceNumber)
      const payment = {
        sale_id: sale.id,
        amount: Number(amount || 0),
        payment_date: paymentDate || new Date().toISOString(),
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
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Invoice number</label>
              <Input
                list="invoiceNumbers"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter or select an invoice"
              />
              <datalist id="invoiceNumbers">
                {invoiceNumbers.map((number) => (
                  <option key={number} value={number} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Amount</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Payment date</label>
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Note</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save payment'}</Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
