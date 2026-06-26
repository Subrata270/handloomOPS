import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'
import useSales from '../../hooks/useSales'
import { formatCurrency, formatDate } from '../../utils/format'
import { supabase } from '../../services/supabaseClient'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCustomerById } = useCustomers()
  const { loadSalesByCustomer } = useSales()
  const [customer, setCustomer] = useState(null)
  const [history, setHistory] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const profile = await getCustomerById(id)
        setCustomer(profile)
        const orders = await loadSalesByCustomer(id)
        setHistory(orders || [])

        // Fetch payments for these sales to calculate outstanding dues
        if (orders && orders.length > 0) {
          const saleIds = orders.map((o) => o.id)
          const { data: payData, error: payError } = await supabase
            .from('payments')
            .select('amount, sale_id')
            .in('sale_id', saleIds)
          
          if (!payError) {
            setPayments(payData || [])
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to load customer details')
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id, getCustomerById, loadSalesByCustomer])

  const statistics = useMemo(() => {
    const totalSpent = history.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const outstanding = Math.max(0, totalSpent - totalPaid)
    const lastPurchaseDate = history[0] ? formatDate(history[0].invoice_date) : '—'

    return { totalSpent, outstanding, lastPurchaseDate }
  }, [history, payments])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Customer details</h1>
          <p className="mt-2 text-sm text-slate-600">Review the customer profile, outstanding dues, and purchase history.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} /> Back to list
        </Button>
      </div>

      {loading ? (
        <Card className="flex min-h-[260px] items-center justify-center">
          <LoadingSpinner />
        </Card>
      ) : error ? (
        <Card className="p-10 text-center text-rose-600">{error}</Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2">Profile details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-semibold">Full Name</p>
                <p className="mt-2 text-xl font-bold text-slate-950 capitalize">{customer.full_name}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500 font-semibold">Phone</p>
                  <p className="mt-2 text-slate-900 font-medium">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">Email</p>
                  <p className="mt-2 text-slate-900 font-medium">{customer.email || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold">Purchase preference</p>
                <p className="mt-2 rounded-2xl bg-slate-50 border px-4 py-3 text-slate-800 capitalize w-fit">{customer.purchase_preference || 'General'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold">Address</p>
                <p className="mt-2 text-slate-900 whitespace-pre-line leading-relaxed">{customer.address || 'Not available'}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2">Account summary</h2>
            <div className="grid grid-cols-2 gap-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
              <span className="font-semibold text-slate-650">Total Orders</span>
              <span className="font-bold text-slate-900">{history.length}</span>
              
              <span className="font-semibold text-slate-650">Last Purchase</span>
              <span className="font-bold text-slate-900">{statistics.lastPurchaseDate}</span>
              
              <span className="font-semibold text-slate-650">Total Spent</span>
              <span className="font-bold text-slate-900">{formatCurrency(statistics.totalSpent)}</span>

              <span className="font-semibold text-slate-650">Outstanding Due</span>
              <span className={`font-bold ${statistics.outstanding > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatCurrency(statistics.outstanding)}
              </span>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Order history</p>
              <h2 className="text-xl font-semibold text-slate-900">Recent purchases</h2>
            </div>
            <Button variant="secondary" onClick={() => navigate('/sales')}>
              <FileText size={16} /> View all sales
            </Button>
          </div>

          {history.length === 0 ? (
            <EmptyState
              title="No purchase history"
              description="This customer has no recorded sales yet. Create a new sale to begin tracking invoices."
              action={<Button variant="primary" onClick={() => navigate('/sales/new')}>Create sale</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Invoice</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold text-right">Total</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {history.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{order.invoice_number}</td>
                      <td className="px-5 py-4">{formatDate(order.invoice_date || order.created_at)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatCurrency(order.total_amount)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          order.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.payment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link to={`/sales/${order.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-250 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          <ExternalLink size={12} /> View Invoice
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
