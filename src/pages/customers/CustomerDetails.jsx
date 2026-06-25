import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'
import useSales from '../../hooks/useSales'
import { formatCurrency, formatDate } from '../../utils/format'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCustomerById } = useCustomers()
  const { loadSalesByCustomer } = useSales()
  const [customer, setCustomer] = useState(null)
  const [history, setHistory] = useState([])
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
        setHistory(orders)
      } catch (err) {
        setError(err.message || 'Unable to load customer details')
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id, getCustomerById, loadSalesByCustomer])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Customer details</h1>
          <p className="mt-2 text-sm text-slate-600">Review the customer profile and recent purchase history.</p>
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
          <Card>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{customer.full_name}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="mt-2 text-slate-900">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="mt-2 text-slate-900">{customer.email || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Purchase preference</p>
                <p className="mt-2 rounded-3xl bg-slate-100 px-4 py-3 text-slate-900">{customer.purchase_preference || 'General'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="mt-2 text-slate-900 whitespace-pre-line">{customer.address || 'Not available'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Purchase history</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{history.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Total orders</div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                <span className="font-semibold">Latest order</span>
                <span>{history[0] ? formatDate(history[0].date) : '—'}</span>
                <span className="font-semibold">Total spent</span>
                <span>{formatCurrency(history.reduce((sum, order) => sum + Number(order.total || 0), 0))}</span>
              </div>
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
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">{order.invoice_number}</td>
                      <td className="px-5 py-4">{formatDate(order.date)}</td>
                      <td className="px-5 py-4">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-4">{order.payment_status || 'Pending'}</td>
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
