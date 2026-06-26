import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FilePlus, Search, Eye } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Input from '../../components/ui/Input'
import useCustomers from '../../hooks/useCustomers'
import useSales from '../../hooks/useSales'
import { fetchPayments } from '../../services/paymentsService'
import { formatCurrency, formatDate } from '../../utils/format'

export default function SalesList() {
  const navigate = useNavigate()
  const { sales, loading: salesLoading, error: salesError, loadSales } = useSales()
  const { customers, loadCustomers } = useCustomers()
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadSales()
    loadCustomers()
    
    const loadPaymentsData = async () => {
      setPaymentsLoading(true)
      try {
        const payData = await fetchPayments()
        setPayments(payData || [])
      } catch (err) {
        console.error('Error fetching payments in sales list', err)
      } finally {
        setPaymentsLoading(false)
      }
    }
    loadPaymentsData()
  }, [loadSales, loadCustomers])

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer.full_name])),
    [customers],
  )

  const paidMap = useMemo(() => {
    const map = {}
    payments.forEach((p) => {
      const saleId = p.sale_id
      map[saleId] = (map[saleId] || 0) + Number(p.amount || 0)
    })
    return map
  }, [payments])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const search = query.toLowerCase()
      const invoice = sale.invoice_number?.toLowerCase() || ''
      const customerName = customerMap[sale.customer_id]?.toLowerCase() || ''
      return invoice.includes(search) || customerName.includes(search)
    })
  }, [customerMap, query, sales])

  const loading = salesLoading || paymentsLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Sales</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Orders & billing</h1>
          <p className="mt-2 text-sm text-slate-600">Review recent sales, payment collection history, and outstanding invoices.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/sales/new">
            <Button>
              <FilePlus size={16} /> Create sale
            </Button>
          </Link>
        </div>
      </div>

      <Card className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Input
          label="Search by invoice or customer"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sales"
          icon={<Search className="h-4 w-4 text-slate-400" />}
        />
      </Card>

      <Card>
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : salesError ? (
          <div className="p-8 text-center text-sm text-rose-600">{salesError}</div>
        ) : filteredSales.length === 0 ? (
          <EmptyState
            title="No sales recorded"
            description="Create a sale to begin tracking invoices and reduce product stock automatically."
            action={<Button onClick={() => navigate('/sales/new')}>Create first sale</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-semibold">Invoice</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold text-right">Invoice Total</th>
                  <th className="px-5 py-4 font-semibold text-right">Paid Amount</th>
                  <th className="px-5 py-4 font-semibold text-right">Outstanding Due</th>
                  <th className="px-5 py-4 font-semibold text-center">Status</th>
                  <th className="px-5 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredSales.map((sale) => {
                  const total = Number(sale.total_amount || 0)
                  const paid = Number(paidMap[sale.id] || 0)
                  const outstanding = Math.max(0, total - paid)

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{sale.invoice_number}</td>
                      <td className="px-5 py-4 capitalize">{customerMap[sale.customer_id] || 'Unknown'}</td>
                      <td className="px-5 py-4">{formatDate(sale.invoice_date || sale.created_at)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatCurrency(total)}</td>
                      <td className="px-5 py-4 text-right text-emerald-600 font-semibold">{formatCurrency(paid)}</td>
                      <td className="px-5 py-4 text-right text-rose-600 font-semibold">{formatCurrency(outstanding)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          sale.payment_status?.toLowerCase() === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sale.payment_status?.toLowerCase() === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sale.payment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye size={14} /> View Invoice
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
