import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'
import useSales from '../../hooks/useSales'
import { formatCurrency, formatDate } from '../../utils/format'

export default function Invoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCustomerById } = useCustomers()
  const { getSaleById } = useSales()
  const [sale, setSale] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  if (!sale || !customer) return;

  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(20);
  doc.text("Sri Mahalakshmi Handlooms", 20, y);

  y += 10;
  doc.setFontSize(12);
  doc.text(`Invoice No: ${sale.invoice_number}`, 20, y);

  y += 8;
  doc.text(`Date: ${formatDate(sale.invoice_date)}`, 20, y);

  y += 8;
  doc.text(`Status: ${sale.payment_status}`, 20, y);

  y += 15;
  doc.text("Bill To:", 20, y);

  y += 8;
  doc.text(customer.full_name, 20, y);

  y += 6;
  doc.text(customer.phone || "-", 20, y);

  y += 6;
  doc.text(customer.email || "-", 20, y);

  y += 12;

  // Table Header
  doc.setFont(undefined, "bold");
  doc.text("Product", 20, y);
  doc.text("Qty", 90, y);
  doc.text("Price", 120, y);
  doc.text("Total", 170, y);

  doc.setFont(undefined, "normal");

  y += 8;

  sale.items.forEach((item) => {
    doc.text(item.product?.saree_name || "-", 20, y);
    doc.text(String(item.quantity), 90, y);
    doc.text(formatCurrency(item.unit_price), 120, y);
    doc.text(formatCurrency(item.total_price), 170, y);
    y += 8;
  });

  y += 15;

  doc.text(`Subtotal : ${formatCurrency(sale.subtotal)}`, 20, y);

  y += 8;

  doc.text(`GST : ${formatCurrency(sale.gst_amount)}`, 20, y);

  y += 8;

  doc.setFont(undefined, "bold");

  doc.text(
    `Grand Total : ${formatCurrency(sale.total_amount)}`,
    20,
    y
  );

  doc.save(`Invoice-${sale.invoice_number}.pdf`);
};

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Invoice</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Invoice #{sale.invoice_number}</h1>
          <p className="mt-2 text-sm text-slate-600">A premium bill ready for printing or download.</p>
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

      <Card>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Bill To</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{customer.full_name}</p>
              <p className="mt-2 text-sm text-slate-700">{customer.phone}</p>
              <p className="text-sm text-slate-700">{customer.email || '—'}</p>
              <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{customer.address}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Invoice details</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Date</p>
                  <p className="mt-2 text-slate-900">{formatDate(sale.date)}</p>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Status</p>
                  <p className="mt-2 text-slate-900">{sale.payment_status || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Totals</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(sale.gst_amount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
                  <span>Grand total</span>
                  <span>{formatCurrency(sale.total_amount)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Invoice notes</p>
              <p className="mt-3 text-sm text-slate-600">Thank you for your purchase. Please keep this invoice for your records.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Unit price</th>
                <th className="px-5 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-900">{item.product?.saree_name || item.product_name}</td>
                  <td className="px-5 py-4">{item.quantity}</td>
                  <td className="px-5 py-4">{formatCurrency(item.unit_price)}</td>
                  <td className="px-5 py-4">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
