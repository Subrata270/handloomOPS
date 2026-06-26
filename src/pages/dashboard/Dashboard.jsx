import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../../services/productService'
import { fetchCustomers } from '../../services/customerService'
import { fetchSales } from '../../services/salesService'
import { fetchExpenses } from '../../services/expensesService'
import { fetchPayments } from '../../services/paymentsService'
import { formatCurrency, formatDate } from '../../utils/format'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  TrendingUp,
  DollarSign,
  Box,
  Users,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  Wallet,
  ArrowRight,
  Receipt,
} from 'lucide-react'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [expenses, setExpenses] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const [p, c, s, e, pay] = await Promise.all([
          fetchProducts(),
          fetchCustomers(),
          fetchSales(),
          fetchExpenses(),
          fetchPayments(),
        ])

        setProducts(p || [])
        setCustomers(c || [])
        setSales(s || [])
        setExpenses(e || [])
        setPayments(pay || [])
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  // Mapped customer lookups
  const customerMap = useMemo(() => {
    return Object.fromEntries(customers.map((c) => [c.id, c.full_name]))
  }, [customers])

  // Calculation of statistics
  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalCustomers = customers.length
    const totalSalesCount = sales.length

    // Revenue, Payments, Expenses
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
    const collectedAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const outstandingAmount = Math.max(0, totalRevenue - collectedAmount)

    // Status counts
    const pendingPaymentsCount = sales.filter(
      (s) => s.payment_status?.toLowerCase() !== 'paid'
    ).length

    const lowStockCount = products.filter(
      (prod) => Number(prod.stock_quantity || 0) <= Number(prod.low_stock_threshold || 5)
    ).length

    // Today & Month Collections
    const todayStr = new Date().toISOString().split('T')[0]
    const todaysCollection = payments
      .filter((p) => (p.payment_date || p.created_at || '').startsWith(todayStr))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const currentMonthPrefix = new Date().toISOString().substring(0, 7) // "YYYY-MM"
    const monthlyCollection = payments
      .filter((p) => (p.payment_date || p.created_at || '').startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return {
      totalProducts,
      totalCustomers,
      totalSalesCount,
      totalRevenue,
      outstandingAmount,
      collectedAmount,
      pendingPaymentsCount,
      todaysCollection,
      monthlyCollection,
      totalExpenses,
      lowStockCount,
    }
  }, [products, customers, sales, expenses, payments])

  // Top 5 Sales sorted by date/invoice descending
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.invoice_date || b.created_at) - new Date(a.invoice_date || a.created_at))
      .slice(0, 5)
  }, [sales])

  // Top 5 Payments sorted by date descending
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
      .slice(0, 5)
  }, [payments])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-rose-600">
        <p className="font-semibold text-lg">Error loading dashboard</p>
        <p className="text-sm mt-2">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500 font-medium">Sri Mahalakshmi Handlooms</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-900">Admin Dashboard</h2>
            <p className="text-sm text-slate-650">Live operations, inventory audit signals, and financial tracking.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 flex items-center gap-2 w-fit border border-slate-100">
            <Calendar className="h-4 w-4 text-slate-400" />
            Last updated just now
          </div>
        </div>
      </section>

      {/* 11 KPI Cards Grid */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {/* Total Revenue */}
        <article className="rounded-3xl border border-slate-900 bg-slate-900 text-white p-5 shadow-sm flex flex-col justify-between h-full min-h-[140px] relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em]">Total Revenue</p>
          </div>
          <p className="mt-2 text-2xl font-bold truncate">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Cumulative sales total</p>
        </article>

        {/* Collected Amount */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Collected Amount</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 truncate">{formatCurrency(stats.collectedAmount)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Total receipts settled</p>
        </article>

        {/* Outstanding Amount */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <Wallet className="h-4 w-4 text-amber-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Outstanding Due</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 truncate">{formatCurrency(stats.outstandingAmount)}</p>
          <p className="text-[10px] text-rose-600 font-semibold mt-1">Uncollected balances</p>
        </article>

        {/* Today's Collection */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Today's Collection</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 truncate">{formatCurrency(stats.todaysCollection)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Settled payments today</p>
        </article>

        {/* Monthly Collection */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-4 w-4 text-teal-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Monthly Collection</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 truncate">{formatCurrency(stats.monthlyCollection)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Collection current month</p>
        </article>

        {/* Total Expenses */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <DollarSign className="h-4 w-4 text-rose-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Total Expenses</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 truncate">{formatCurrency(stats.totalExpenses)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Operating overhead total</p>
        </article>

        {/* Total Sales */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <ShoppingBag className="h-4 w-4 text-violet-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Total Sales</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalSalesCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Invoices registered</p>
        </article>

        {/* Pending Payments */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Pending Payments</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.pendingPaymentsCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Pending/Partial invoices</p>
        </article>

        {/* Total Products */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <Box className="h-4 w-4 text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Total Products</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active saree designs</p>
        </article>

        {/* Total Customers */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="h-4 w-4 text-indigo-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Total Customers</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalCustomers}</p>
          <p className="text-[10px] text-slate-500 mt-1">Registered accounts</p>
        </article>

        {/* Low Stock Products */}
        <article className={`rounded-3xl border p-5 shadow-sm flex flex-col justify-between h-full min-h-[140px] ${
          stats.lowStockCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200 shadow-slate-100/50'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${stats.lowStockCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>Low Stock Products</p>
          </div>
          <p className={`mt-2 text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{stats.lowStockCount}</p>
          <p className={`text-[10px] mt-1 ${stats.lowStockCount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
            {stats.lowStockCount > 0 ? 'Requires re-order' : 'All stocks healthy'}
          </p>
        </article>
      </section>

      {/* Two Modern Tables Grid */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Sales Activity */}
        <Card className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Sales Activity</h3>
                <p className="text-xs text-slate-500">Overview of the latest 5 orders received.</p>
              </div>
              <Link to="/sales">
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-slate-950 transition">
                  View All <ArrowRight size={13} />
                </button>
              </Link>
            </div>

            <div className="overflow-x-auto min-h-[220px]">
              {recentSales.length === 0 ? (
                <p className="text-slate-400 text-sm py-12 text-center">No sales records registered yet.</p>
              ) : (
                <table className="min-w-full text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-3">Invoice Number</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3 text-right">Amount</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentSales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-3 font-semibold text-slate-950">
                          <Link to={`/sales/invoice/${s.id}`} className="hover:underline text-slate-800">
                            {s.invoice_number}
                          </Link>
                        </td>
                        <td className="px-3 py-3 capitalize truncate max-w-[120px]">{customerMap[s.customer_id] || '—'}</td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-950">{formatCurrency(s.total_amount)}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            s.payment_status?.toLowerCase() === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.payment_status?.toLowerCase() === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.payment_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500">{formatDate(s.invoice_date || s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>

        {/* Recent Payments Ledger */}
        <Card className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Payments Ledger</h3>
                <p className="text-xs text-slate-500">Logs of the latest 5 transaction installments received.</p>
              </div>
              <Link to="/payments">
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-slate-950 transition">
                  View All <ArrowRight size={13} />
                </button>
              </Link>
            </div>

            <div className="overflow-x-auto min-h-[220px]">
              {recentPayments.length === 0 ? (
                <p className="text-slate-400 text-sm py-12 text-center">No payment entries logged yet.</p>
              ) : (
                <table className="min-w-full text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-3">Invoice</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3 text-right">Paid Amount</th>
                      <th className="px-3 py-3 text-right">Remaining Due</th>
                      <th className="px-3 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentPayments.map((p) => {
                      const saleObj = sales.find((s) => s.id === p.sale_id)
                      const totalForSale = Number(saleObj?.total_amount || 0)
                      const paymentsForThisSale = payments.filter((item) => item.sale_id === p.sale_id)
                      const totalPaidForSale = paymentsForThisSale.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                      const remainingDueForSale = Math.max(0, totalForSale - totalPaidForSale)

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-3 font-semibold text-slate-950">
                            <Link to={`/payments/${p.id}`} className="hover:underline text-slate-800">
                              {p.sales?.invoice_number || '—'}
                            </Link>
                          </td>
                          <td className="px-3 py-3 capitalize truncate max-w-[120px]">{customerMap[p.sales?.customer_id] || '—'}</td>
                          <td className="px-3 py-3 text-right font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-3 text-right font-medium text-slate-700">{formatCurrency(remainingDueForSale)}</td>
                          <td className="px-3 py-3 text-slate-500">{formatDate(p.payment_date || p.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
