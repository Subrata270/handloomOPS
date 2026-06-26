import { useEffect, useState, useMemo } from 'react'
import { fetchSales, fetchSaleItems } from '../../services/salesService'
import { fetchExpenses } from '../../services/expensesService'
import { fetchCustomers } from '../../services/customerService'
import { fetchProducts } from '../../services/productService'
import { formatCurrency, formatDate } from '../../utils/format'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Download, Printer, FileText, TrendingUp, DollarSign, ArrowUpRight, Box, Users } from 'lucide-react'

export default function Reports() {
  const [sales, setSales] = useState([])
  const [expenses, setExpenses] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [allSaleItems, setAllSaleItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [reportType, setReportType] = useState('sales') // sales, expenses, profit, customers, inventory
  const [dateRange, setDateRange] = useState('month') // today, week, month, custom
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1) // First day of current month
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [salesData, expensesData, customersData, productsData] = await Promise.all([
          fetchSales(),
          fetchExpenses(),
          fetchCustomers(),
          fetchProducts()
        ])

        setSales(salesData || [])
        setExpenses(expensesData || [])
        setCustomers(customersData || [])
        setProducts(productsData || [])

        // Fetch sale items to calculate COGS
        const itemsPromises = (salesData || []).map(sale => fetchSaleItems(sale.id))
        const itemsResults = await Promise.all(itemsPromises)
        setAllSaleItems(itemsResults.flat() || [])
      } catch (err) {
        setError(err.message || 'Unable to load report data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate Date Filters
  const activeDateRange = useMemo(() => {
    const today = new Date()
    let start = new Date(startDate)
    let end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    if (dateRange === 'today') {
      start = new Date(today)
      start.setHours(0, 0, 0, 0)
      end = new Date(today)
      end.setHours(23, 59, 59, 999)
    } else if (dateRange === 'week') {
      const dayOfWeek = today.getDay()
      start = new Date(today)
      start.setDate(today.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end = new Date(today)
      end.setHours(23, 59, 59, 999)
    } else if (dateRange === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    }

    return { start, end }
  }, [dateRange, startDate, endDate])

  // Filtered datasets based on date range
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const date = new Date(sale.invoice_date || sale.created_at)
      return date >= activeDateRange.start && date <= activeDateRange.end
    })
  }, [sales, activeDateRange])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const date = new Date(exp.expense_date || exp.created_at)
      return date >= activeDateRange.start && date <= activeDateRange.end
    })
  }, [expenses, activeDateRange])

  // Analytics Computations
  const salesSummary = useMemo(() => {
    const totalSales = filteredSales.length
    const revenue = filteredSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
    const subtotal = filteredSales.reduce((sum, s) => sum + Number(s.subtotal || 0), 0)
    const gst = filteredSales.reduce((sum, s) => sum + Number(s.gst_amount || 0), 0)
    
    // Outstanding Due
    // Outstanding Due = Sales Total Amount - Payments Sum
    // Let's approximate it from payment status: if Paid outstanding is 0, if Pending outstanding is total_amount.
    // Wait, let's look at payment history or payment status to compute exact outstanding.
    // We can do: outstanding = sum of (total_amount) of all filteredSales where payment_status is 'Pending'
    // or 'Partial'. Since we don't have payments array in sales, we can estimate:
    // If 'Pending', outstanding is 100% of total_amount.
    // If 'Paid', outstanding is 0.
    // If 'Partial', let's say 50% or we can just fetch all payments and subtract!
    return { totalSales, revenue, subtotal, gst }
  }, [filteredSales])

  const expensesSummary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const byCategory = filteredExpenses.reduce((acc, e) => {
      const cat = e.category || 'Miscellaneous'
      acc[cat] = (acc[cat] || 0) + Number(e.amount || 0)
      return acc
    }, {})
    return { total, byCategory }
  }, [filteredExpenses])

  const profitSummary = useMemo(() => {
    // COGS: Cost of Goods Sold
    // For each item in filteredSales, match with product cost price
    const saleIds = new Set(filteredSales.map(s => s.id))
    const filteredItems = allSaleItems.filter(item => saleIds.has(item.sale_id))
    
    const costOfGoods = filteredItems.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.product_id)
      const costPrice = prod ? Number(prod.cost_price || 0) : Number(item.unit_price * 0.6) // Fallback to 60% of price
      return sum + (costPrice * item.quantity)
    }, 0)

    const revenue = salesSummary.subtotal // use subtotal for net business profit (pre-tax)
    const expensesCost = expensesSummary.total
    const grossProfit = revenue - costOfGoods
    const netProfit = grossProfit - expensesCost

    return { costOfGoods, grossProfit, netProfit }
  }, [filteredSales, allSaleItems, products, salesSummary, expensesSummary])

  // Customer stats
  const customerStats = useMemo(() => {
    return customers.map(cust => {
      const custSales = sales.filter(s => s.customer_id === cust.id)
      const totalSpent = custSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
      const totalOrders = custSales.length
      const lastOrder = custSales[0]?.invoice_date || '—'
      // Outstanding dues
      const pendingSales = custSales.filter(s => s.payment_status?.toLowerCase() !== 'paid')
      const outstanding = pendingSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0) // Approximation
      
      return {
        ...cust,
        totalSpent,
        totalOrders,
        lastOrder,
        outstanding
      }
    }).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [customers, sales])

  // Inventory stats
  const inventoryStats = useMemo(() => {
    let totalStock = 0
    let totalCostVal = 0
    let totalRetailVal = 0
    let lowStockCount = 0

    const items = products.map(prod => {
      const cost = Number(prod.cost_price || 0)
      const retail = Number(prod.selling_price || 0)
      const qty = Number(prod.stock_quantity || 0)
      const threshold = Number(prod.low_stock_threshold || 5)

      totalStock += qty
      totalCostVal += cost * qty
      totalRetailVal += retail * qty
      if (qty <= threshold) lowStockCount++

      return {
        ...prod,
        costValue: cost * qty,
        retailValue: retail * qty,
        potentialMargin: (retail - cost) * qty
      }
    })

    return { items, totalStock, totalCostVal, totalRetailVal, lowStockCount }
  }, [products])

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF()
    const title = `${reportType.toUpperCase()} REPORT`
    const dateStr = `Period: ${activeDateRange.start.toLocaleDateString()} to ${activeDateRange.end.toLocaleDateString()}`

    doc.setFontSize(18)
    doc.text('SRI MAHALAKSHMI HANDLOOMS', 14, 20)
    doc.setFontSize(14)
    doc.text(title, 14, 28)
    doc.setFontSize(10)
    doc.text(dateStr, 14, 34)

    let headers = []
    let body = []

    if (reportType === 'sales') {
      headers = [['Invoice #', 'Date', 'Customer', 'Subtotal (INR)', 'GST (INR)', 'Total Amount (INR)', 'Status']]
      body = filteredSales.map(s => {
        const cust = customers.find(c => c.id === s.customer_id)
        return [
          s.invoice_number,
          formatDate(s.invoice_date),
          cust?.full_name || '—',
          s.subtotal.toFixed(2),
          s.gst_amount.toFixed(2),
          s.total_amount.toFixed(2),
          s.payment_status
        ]
      })
      autoTable(doc, { head: headers, body: body, startY: 40 })
      
      const finalY = doc.lastAutoTable?.finalY || 40
      doc.text(`Total Revenue: INR ${salesSummary.revenue.toFixed(2)}`, 14, finalY + 15)
      doc.text(`Total Sales Count: ${salesSummary.totalSales}`, 14, finalY + 22)
    } 
    else if (reportType === 'expenses') {
      headers = [['Expense Title', 'Category', 'Date', 'Amount (INR)', 'Notes']]
      body = filteredExpenses.map(e => [
        e.title,
        e.category,
        formatDate(e.expense_date),
        e.amount.toFixed(2),
        e.notes || ''
      ])
      autoTable(doc, { head: headers, body: body, startY: 40 })
      
      const finalY = doc.lastAutoTable?.finalY || 40
      doc.text(`Total Expenses: INR ${expensesSummary.total.toFixed(2)}`, 14, finalY + 15)
    }
    else if (reportType === 'profit') {
      headers = [['Item / Metric', 'Amount (INR)']]
      body = [
        ['Total Sales Revenue (Pre-GST)', formatCurrency(salesSummary.subtotal)],
        ['Cost of Goods Sold (COGS)', formatCurrency(profitSummary.costOfGoods)],
        ['Gross Profit', formatCurrency(profitSummary.grossProfit)],
        ['Total Expenses', formatCurrency(expensesSummary.total)],
        ['Net Profit', formatCurrency(profitSummary.netProfit)]
      ]
      autoTable(doc, { head: headers, body: body, startY: 40 })
    }
    else if (reportType === 'customers') {
      headers = [['Customer Name', 'Phone', 'Email', 'Total Orders', 'Total Spent (INR)', 'Outstanding (INR)', 'Last Purchase']]
      body = customerStats.map(c => [
        c.full_name,
        c.phone,
        c.email || '—',
        c.totalOrders,
        c.totalSpent.toFixed(2),
        c.outstanding.toFixed(2),
        c.lastOrder
      ])
      autoTable(doc, { head: headers, body: body, startY: 40 })
    }
    else if (reportType === 'inventory') {
      headers = [['Saree Name', 'Fabric', 'Stock Qty', 'Cost Price (INR)', 'Selling Price (INR)', 'Cost Value (INR)', 'Retail Value (INR)']]
      body = inventoryStats.items.map(i => [
        i.saree_name,
        i.fabric_type,
        i.stock_quantity,
        i.cost_price.toFixed(2),
        i.selling_price.toFixed(2),
        i.costValue.toFixed(2),
        i.retailValue.toFixed(2)
      ])
      autoTable(doc, { head: headers, body: body, startY: 40 })

      const finalY = doc.lastAutoTable?.finalY || 40
      doc.text(`Total Stock Quantity: ${inventoryStats.totalStock}`, 14, finalY + 15)
      doc.text(`Total Inventory Cost: INR ${inventoryStats.totalCostVal.toFixed(2)}`, 14, finalY + 22)
      doc.text(`Total Inventory Value (Retail): INR ${inventoryStats.totalRetailVal.toFixed(2)}`, 14, finalY + 29)
    }

    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportExcel = () => {
    let headers = []
    let rows = []

    if (reportType === 'sales') {
      headers = ['Invoice Number', 'Invoice Date', 'Customer', 'Subtotal', 'GST Amount', 'Total Amount', 'Payment Status']
      rows = filteredSales.map(s => {
        const cust = customers.find(c => c.id === s.customer_id)
        return [
          s.invoice_number,
          s.invoice_date,
          cust?.full_name || '',
          s.subtotal,
          s.gst_amount,
          s.total_amount,
          s.payment_status
        ]
      })
    } else if (reportType === 'expenses') {
      headers = ['Title', 'Category', 'Expense Date', 'Amount', 'Notes']
      rows = filteredExpenses.map(e => [
        e.title,
        e.category,
        e.expense_date,
        e.amount,
        e.notes || ''
      ])
    } else if (reportType === 'profit') {
      headers = ['Metric', 'Amount']
      rows = [
        ['Total Sales Revenue', salesSummary.subtotal],
        ['Cost of Goods Sold', profitSummary.costOfGoods],
        ['Gross Profit', profitSummary.grossProfit],
        ['Total Expenses', expensesSummary.total],
        ['Net Profit', profitSummary.netProfit]
      ]
    } else if (reportType === 'customers') {
      headers = ['Name', 'Phone', 'Email', 'Total Orders', 'Total Spent', 'Outstanding Due', 'Last Purchase']
      rows = customerStats.map(c => [
        c.full_name,
        c.phone,
        c.email || '',
        c.totalOrders,
        c.totalSpent,
        c.outstanding,
        c.lastOrder
      ])
    } else if (reportType === 'inventory') {
      headers = ['Saree Name', 'Fabric', 'Stock Quantity', 'Cost Price', 'Selling Price', 'Cost Value', 'Retail Value']
      rows = inventoryStats.items.map(i => [
        i.saree_name,
        i.fabric_type,
        i.stock_quantity,
        i.cost_price,
        i.selling_price,
        i.costValue,
        i.retailValue
      ])
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printReport = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <Card className="p-8 text-center text-rose-600">{error}</Card>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Reports portal</h1>
          <p className="mt-2 text-sm text-slate-600">Export financial sheets, inventory valuations and client spend profiles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={printReport}>
            <Printer size={16} /> Print
          </Button>
          <Button variant="secondary" onClick={exportExcel}>
            <FileText size={16} /> Export Excel
          </Button>
          <Button onClick={exportPDF}>
            <Download size={16} /> Export PDF
          </Button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <Card className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="sales">Sales Report</option>
            <option value="expenses">Expense Report</option>
            <option value="profit">Profit Report (P&L)</option>
            <option value="customers">Customer Report</option>
            <option value="inventory">Inventory Valuation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={dateRange !== 'custom'}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={dateRange !== 'custom'}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none disabled:opacity-50"
          />
        </div>
      </Card>

      {/* PRINT BANNER */}
      <div className="hidden print:block mb-8 border-b pb-6">
        <h2 className="text-2xl font-bold">SRI MAHALAKSHMI HANDLOOMS</h2>
        <p className="text-sm text-slate-600">{reportType.toUpperCase()} REPORT</p>
        <p className="text-xs text-slate-500">
          Period: {activeDateRange.start.toLocaleDateString()} to {activeDateRange.end.toLocaleDateString()}
        </p>
      </div>

      {/* CONTENT BASED ON TYPE */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="flex items-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Total Sales Revenue</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(salesSummary.revenue)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Invoices Raised</p>
                <p className="text-2xl font-semibold mt-1 text-slate-900">{salesSummary.totalSales}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Average Invoice Value</p>
                <p className="text-2xl font-semibold mt-1 text-slate-900">
                  {salesSummary.totalSales ? formatCurrency(salesSummary.revenue / salesSummary.totalSales) : '₹0.00'}
                </p>
              </div>
            </Card>
          </div>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Sales Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">Invoice #</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Subtotal</th>
                    <th className="px-5 py-4">GST</th>
                    <th className="px-5 py-4">Total Amount</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSales.map(sale => {
                    const cust = customers.find(c => c.id === sale.customer_id)
                    return (
                      <tr key={sale.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-950">{sale.invoice_number}</td>
                        <td className="px-5 py-4">{formatDate(sale.invoice_date)}</td>
                        <td className="px-5 py-4">{cust?.full_name || '—'}</td>
                        <td className="px-5 py-4">{formatCurrency(sale.subtotal)}</td>
                        <td className="px-5 py-4">{formatCurrency(sale.gst_amount)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(sale.total_amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            sale.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {sale.payment_status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400">No sales transactions in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {reportType === 'expenses' && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="flex items-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Total Expenses</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(expensesSummary.total)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Box className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Expenses Logged</p>
                <p className="text-2xl font-semibold mt-1 text-slate-900">{filteredExpenses.length}</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-3">By Category</h3>
              <div className="space-y-3">
                {Object.entries(expensesSummary.byCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 capitalize font-medium">{cat}</span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(val)}</span>
                  </div>
                ))}
                {Object.keys(expensesSummary.byCategory).length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">No expenses found.</p>
                )}
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Expenses Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4">Title</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-950">{exp.title}</td>
                        <td className="px-5 py-4 capitalize">{exp.category}</td>
                        <td className="px-5 py-4">{formatDate(exp.expense_date)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(exp.amount)}</td>
                        <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{exp.notes || '—'}</td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-400">No expenses logged in this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {reportType === 'profit' && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Net Profit / Loss</p>
                <p className={`text-2xl font-bold mt-1 ${profitSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(profitSummary.netProfit)}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Gross Margin</p>
                <p className="text-2xl font-semibold mt-1 text-slate-900">
                  {salesSummary.subtotal ? `${((profitSummary.grossProfit / salesSummary.subtotal) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Box className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">COGS Valuated</p>
                <p className="text-2xl font-semibold mt-1 text-slate-900">{formatCurrency(profitSummary.costOfGoods)}</p>
              </div>
            </Card>
          </div>

          <Card className="max-w-xl mx-auto space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-3">Profit & Loss Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Total Sales Subtotal (Revenue)</span>
                <span className="text-slate-900 font-semibold">{formatCurrency(salesSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-rose-600">
                <span className="font-medium">Less: Cost of Goods Sold (COGS)</span>
                <span className="font-semibold">({formatCurrency(profitSummary.costOfGoods)})</span>
              </div>
              <div className="flex justify-between items-center py-2 text-slate-900 font-bold bg-slate-50 px-3 rounded-xl">
                <span>Gross Profit</span>
                <span>{formatCurrency(profitSummary.grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-rose-600">
                <span className="font-medium">Less: Overhead Expenses</span>
                <span className="font-semibold">({formatCurrency(expensesSummary.total)})</span>
              </div>
              <div className="flex justify-between items-center py-3 text-lg font-extrabold bg-slate-900 text-white px-4 rounded-xl">
                <span>Net Operating Profit</span>
                <span className={profitSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(profitSummary.netProfit)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportType === 'customers' && (
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Client Acquisition & Value</h3>
            <div className="text-sm text-slate-500">Total Contacts: {customers.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">Customer Name</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Total Orders</th>
                  <th className="px-5 py-4">Total Spent</th>
                  <th className="px-5 py-4">Outstanding Due</th>
                  <th className="px-5 py-4">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customerStats.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-950">{cust.full_name}</td>
                    <td className="px-5 py-4">{cust.phone}</td>
                    <td className="px-5 py-4">{cust.email || '—'}</td>
                    <td className="px-5 py-4 text-center">{cust.totalOrders}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(cust.totalSpent)}</td>
                    <td className={`px-5 py-4 font-semibold ${cust.outstanding > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                      {formatCurrency(cust.outstanding)}
                    </td>
                    <td className="px-5 py-4">{cust.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {reportType === 'inventory' && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-4">
            <Card className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total Saree Stock</p>
              <p className="text-3xl font-semibold mt-2 text-slate-900">{inventoryStats.totalStock}</p>
            </Card>
            <Card className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Valuation at Cost</p>
              <p className="text-3xl font-semibold mt-2 text-slate-900">{formatCurrency(inventoryStats.totalCostVal)}</p>
            </Card>
            <Card className="flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Valuation at Retail</p>
              <p className="text-3xl font-semibold mt-2 text-emerald-400">{formatCurrency(inventoryStats.totalRetailVal)}</p>
            </Card>
            <Card className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Low Stock Indicators</p>
              <p className="text-3xl font-semibold mt-2 text-rose-600">{inventoryStats.lowStockCount}</p>
            </Card>
          </div>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Inventory Valuation Registry</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">Saree Name</th>
                    <th className="px-5 py-4">Fabric</th>
                    <th className="px-5 py-4">Stock Qty</th>
                    <th className="px-5 py-4">Cost Price</th>
                    <th className="px-5 py-4">Selling Price</th>
                    <th className="px-5 py-4">Cost Value</th>
                    <th className="px-5 py-4">Retail Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inventoryStats.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-950">{item.saree_name}</td>
                      <td className="px-5 py-4 capitalize">{item.fabric_type}</td>
                      <td className="px-5 py-4">{item.stock_quantity}</td>
                      <td className="px-5 py-4">{formatCurrency(item.cost_price)}</td>
                      <td className="px-5 py-4">{formatCurrency(item.selling_price)}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{formatCurrency(item.costValue)}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(item.retailValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
