import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'
import useProducts from '../../hooks/useProducts'
import useSales from '../../hooks/useSales'
import { formatCurrency } from '../../utils/format'

const initialRow = {
    product_id: '',
    product_name: '',
    quantity: 1,
    stock: 0,
    unit_price: 0,
    total: 0,
}

export default function NewSale() {
    const navigate = useNavigate()
    const { customers, loadCustomers } = useCustomers()
    const { products, loading: productsLoading, fetchProducts } = useProducts()
    const { submitSale } = useSales()
    const [items, setItems] = useState([initialRow])
    const [customerId, setCustomerId] = useState('')
    const [paymentStatus, setPaymentStatus] = useState('Paid')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadCustomers()
        fetchProducts()
    }, [loadCustomers, fetchProducts])

    const invoiceNumber = useMemo(() => `INV-${new Date().getTime()}`, [])

    const updateRow = (index, updates) => {
        setItems((current) =>
            current.map((row, rowIndex) => {
                if (rowIndex !== index) return row
                const nextRow = { ...row, ...updates }
                if (updates.product_id) {
                    const product = products.find((item) => item.id === updates.product_id)
                    if (product) {
                        nextRow.product_name = product.saree_name
                        nextRow.unit_price = Number(product.selling_price || 0)
                        nextRow.stock = Number(product.stock_quantity || 0)
                        nextRow.quantity = 1
                    }
                }
                nextRow.total = Number(nextRow.unit_price || 0) * Number(nextRow.quantity || 0)
                return nextRow
            }),
        )
    }

    const removeRow = (index) => {
        setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))
    }

    const addRow = () => {
        setItems((current) => [...current, { ...initialRow }])
    }

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.total || 0), 0), [items])
    const gst = useMemo(() => Number((subtotal * 0.18).toFixed(2)), [subtotal])
    const grandTotal = useMemo(() => subtotal + gst, [subtotal, gst])

    const validateSale = () => {
        if (!customerId) {
            setError('Please select a customer for this sale.')
            return false
        }
        const validRows = items.filter((row) => row.product_id)
        if (!validRows.length) {
            setError('Add at least one product to the sale.')
            return false
        }
        for (const row of validRows) {
            if (!row.quantity || row.quantity <= 0) {
                setError('Quantity must be at least 1 for every product.')
                return false
            }
            if (row.quantity > row.stock) {
                setError(`Quantity for ${row.product_name} exceeds available stock.`)
                return false
            }
        }
        setError(null)
        return true
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validateSale()) return

        setLoading(true)
        try {
            const sale = {
                customer_id: customerId,
                invoice_number: invoiceNumber,
                invoice_date: new Date().toISOString().split("T")[0],
                subtotal,
                gst_percentage: 18, // ya jo GST percentage hai
                gst_amount: gst,
                total_amount: grandTotal,
                payment_status: paymentStatus,
                due_date: null,
            }

            const saleResult = await submitSale(sale, items.filter((row) => row.product_id))
            window.dispatchEvent(new Event('productsUpdated'))
            navigate(`/sales/${saleResult.id}`)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Sales</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">New sale</h1>
                    <p className="mt-2 text-sm text-slate-600">Create an order, calculate GST, and reduce stock automatically.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <Card>
                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Customer</label>
                            <select
                                value={customerId}
                                onChange={(event) => setCustomerId(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                            >
                                <option value="">Select customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>{customer.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg font-semibold text-slate-900">Products</h2>
                                <Button type="button" variant="secondary" onClick={addRow}>
                                    <Plus size={16} /> Add item
                                </Button>
                            </div>

                            {productsLoading ? (
                                <div className="flex min-h-[180px] items-center justify-center">
                                    <LoadingSpinner />
                                </div>
                            ) : items.length === 0 ? (
                                <EmptyState title="Add products" description="Start by adding one or more products to the sale." action={<Button type="button" onClick={addRow}>Add item</Button>} />
                            ) : (
                                <div className="space-y-4">
                                    {items.map((row, index) => (
                                        <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_0.8fr_0.8fr]">
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Product
                                                    <select
                                                        value={row.product_id}
                                                        onChange={(event) => updateRow(index, { product_id: event.target.value })}
                                                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                                                    >
                                                        <option value="">Select product</option>
                                                        {products.map((product) => (
                                                            <option key={product.id} value={product.id}>{product.saree_name}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Quantity
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(event) => {
                                                            const value = Number(event.target.value)
                                                            updateRow(index, { quantity: value > 0 ? value : 1 })
                                                        }}
                                                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                                                    />
                                                </label>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">Unit price</p>
                                                    <p className="mt-2 text-slate-900">{formatCurrency(row.unit_price)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">Stock</p>
                                                    <p className="mt-2 text-slate-900">{row.stock}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600">
                                                <p>Total: <span className="font-semibold text-slate-900">{formatCurrency(row.total)}</span></p>
                                                <button type="button" onClick={() => removeRow(index)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Payment status</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(event) => setPaymentStatus(event.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <div className="flex items-end justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving sale...' : 'Save sale'}
                                </Button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-rose-600">{error}</p>}
                    </div>
                </Card>

                <Card>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Summary</p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Invoice details</h2>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <span className="font-semibold text-slate-900">Invoice</span>
                                <span>{invoiceNumber}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-4">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-4">
                                    <span>GST (12%)</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(gst)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900 px-4 py-4 text-white">
                                    <span className="font-semibold">Grand total</span>
                                    <span className="text-xl font-semibold">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    )
}
