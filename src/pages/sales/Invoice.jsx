import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'
import useSales from '../../hooks/useSales'
import { formatCurrency, formatDate } from '../../utils/format'
import { getSettings } from '../../services/settingsService'

export default function Invoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCustomerById } = useCustomers()
  const { getSaleById } = useSales()
  const [sale, setSale] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [business, setBusiness] = useState({})

  useEffect(() => {
    setBusiness(getSettings())
  }, [])

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true)
      setError(null)

      try {
        const saleRecord = await getSaleById(id)
        setSale(saleRecord)
        const customerRecord = await getCustomerById(saleRecord.customer_id)
        setCustomer(customerRecord)
      } catch (err) {
        setError(err.message || 'Unable to load invoice')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadInvoice()
  }, [id, getCustomerById, getSaleById])

  const downloadPdf = () => {
    if (!sale || !customer) return

    const doc = new jsPDF()
    const settings = getSettings()

    // Header strip
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(0, 0, 210, 15, 'F')

    // Company profile
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(15, 23, 42)
    doc.text(settings.businessName, 14, 32)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(settings.address, 14, 39, { maxWidth: 100 })
    doc.text(`Phone: ${settings.phone} | Email: ${settings.email}`, 14, 49)
    doc.text(`GSTIN: ${settings.gstin}`, 14, 54)

    // Invoice meta
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('TAX INVOICE', 145, 32)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(`Invoice No: ${sale.invoice_number}`, 145, 39)
    doc.text(`Date: ${formatDate(sale.invoice_date)}`, 145, 44)
    doc.text(`Payment Status: ${sale.payment_status}`, 145, 49)

    doc.setDrawColor(226, 232, 240)
    doc.line(14, 60, 196, 60)

    // Bill To
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('BILL TO:', 14, 69)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(customer.full_name, 14, 75)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(customer.address || '', 14, 81, { maxWidth: 100 })
    doc.text(`Phone: ${customer.phone || '-'}`, 14, 93)
    doc.text(`Email: ${customer.email || '-'}`, 14, 98)

    // Items table
    const tableColumn = ['Product Saree Name', 'Quantity', 'Unit Price (INR)', 'Total Price (INR)']
    const tableRows = sale.items.map((item) => [
      item.product?.saree_name || item.product_name || '-',
      String(item.quantity),
      formatCurrency(item.unit_price),
      formatCurrency(item.total_price),
    ])

    autoTable(doc, {
      startY: 106,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 37, halign: 'right' },
      },
    })

    const finalY = doc.lastAutoTable.finalY + 10

    // Calculations
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text('Subtotal:', 130, finalY)
    doc.text(formatCurrency(sale.subtotal), 196, finalY, { align: 'right' })

    doc.text(`GST (${sale.gst_percentage || 12}%):`, 130, finalY + 6)
    doc.text(formatCurrency(sale.gst_amount), 196, finalY + 6, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Grand Total:', 130, finalY + 13)
    doc.text(formatCurrency(sale.total_amount), 196, finalY + 13, { align: 'right' })

    // Terms
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Terms & Conditions:', 14, finalY)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(settings.termsAndConditions || '', 14, finalY + 5, { maxWidth: 100 })

    // Thank You Note
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('Thank you for your business!', 14, finalY + 35)

    // Signature Area
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text('Authorized Signature', 150, finalY + 35)
    doc.line(140, finalY + 30, 196, finalY + 30)

    doc.save(`Invoice-${sale.invoice_number}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-10 text-center text-rose-600">{error}</Card>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between print:hidden">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Invoice</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Invoice #{sale.invoice_number}</h1>
          <p className="mt-2 text-sm text-slate-600">A premium tax invoice ready for printing or download.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/sales')}>
            <ArrowLeft size={16} /> Back to sales
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={16} /> Print
          </Button>
          <Button onClick={downloadPdf}>
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="p-8 md:p-12 bg-white border border-slate-200 shadow-lg print:border-0 print:shadow-none">
        {/* Printable Invoice Header */}
        <div className="flex flex-col gap-6 md:flex-row md:justify-between pb-8 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{business.businessName}</h2>
            <p className="mt-2 text-sm text-slate-600 whitespace-pre-line max-w-sm">{business.address}</p>
            <p className="mt-1 text-sm text-slate-600">Phone: {business.phone}</p>
            <p className="text-sm text-slate-600">Email: {business.email}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">GSTIN: {business.gstin}</p>
          </div>
          <div className="md:text-right">
            <h3 className="text-xl font-bold text-slate-900 tracking-wider">TAX INVOICE</h3>
            <div className="mt-4 space-y-1.5 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Invoice No:</span> {sale.invoice_number}</p>
              <p><span className="font-semibold text-slate-900">Date:</span> {formatDate(sale.invoice_date)}</p>
              <p><span className="font-semibold text-slate-900">Payment Status:</span> 
                <span className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  sale.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sale.payment_status || 'Pending'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bill To & Details */}
        <div className="grid gap-6 md:grid-cols-2 py-8 border-b border-slate-200">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-3">BILL TO</p>
            <p className="text-lg font-bold text-slate-900">{customer.full_name}</p>
            <p className="mt-2 text-sm text-slate-650 whitespace-pre-line text-slate-700">{customer.address}</p>
            <p className="mt-2 text-sm text-slate-700">Phone: {customer.phone}</p>
            <p className="text-sm text-slate-700">Email: {customer.email || '—'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-8 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold">
                <th className="pb-4 font-bold">Product Saree Name</th>
                <th className="pb-4 text-center font-bold">Quantity</th>
                <th className="pb-4 text-right font-bold">Unit Price</th>
                <th className="pb-4 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-4 font-semibold text-slate-900 capitalize">{item.product?.saree_name || item.product_name}</td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-4 text-right font-semibold text-slate-900">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Block */}
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] pt-4">
          <div>
            {business.termsAndConditions && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Terms & Conditions</p>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{business.termsAndConditions}</p>
              </div>
            )}
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3.5 text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>GST ({sale.gst_percentage || 12}%)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(sale.gst_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
              <span>Grand Total</span>
              <span className="text-lg">{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Signature Area (Print only) */}
        <div className="hidden print:flex justify-end mt-16 pt-8">
          <div className="text-center w-60 border-t border-slate-300 pt-3">
            <p className="text-sm font-semibold text-slate-900">Authorized Signature</p>
            <p className="text-xs text-slate-500 mt-1">{business.businessName}</p>
          </div>
        </div>

        {/* Thank You Note */}
        <div className="mt-8 text-center text-slate-500 border-t pt-4">
          <p className="text-sm italic font-medium">Thank you for your business!</p>
        </div>
      </Card>
    </div>
  )
}
