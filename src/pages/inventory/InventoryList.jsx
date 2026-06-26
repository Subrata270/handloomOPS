import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Plus, Search, Trash2, SlidersHorizontal } from 'lucide-react'
import useProducts from '../../hooks/useProducts'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'

export default function InventoryList() {
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [stockFilter, setStockFilter] = useState('all') // all, healthy, low, out
  const [pendingDelete, setPendingDelete] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, stockFilter])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = search.toLowerCase()
      const matchesSearch =
        product.saree_name?.toLowerCase().includes(term) ||
        product.design_name?.toLowerCase().includes(term) ||
        product.fabric_type?.toLowerCase().includes(term)

      const matchesStatus = status === 'all' || product.status?.toLowerCase() === status

      let matchesStock = true
      const stock = product.stock_quantity ?? 0
      const thresh = product.low_stock_threshold ?? 5
      
      if (stockFilter === 'out') {
        matchesStock = stock === 0
      } else if (stockFilter === 'low') {
        matchesStock = stock > 0 && stock <= thresh
      } else if (stockFilter === 'healthy') {
        matchesStock = stock > thresh
      }

      return matchesSearch && matchesStatus && matchesStock
    })
  }, [products, search, status, stockFilter])

  // Paginated dataset
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const handleDeleteConfirm = (id) => {
    setPendingDelete(id)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    await deleteProduct(pendingDelete)
    setPendingDelete(null)
    setConfirmOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Inventory</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Product Catalogue</h2>
          <p className="mt-1 text-sm text-slate-600">Manage sarees, stock levels, threshold alerts and pricing.</p>
        </div>
        <Link to="/inventory/add" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total Products</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{products.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Filtered results</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{filteredProducts.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Low Stock Indicators</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">
            {products.filter((p) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5)).length}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="rounded-3xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-500">Search Catalogue</span>
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Search by saree, design, fabric..."
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
        </label>

        <label className="rounded-3xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-500">Filter by Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label className="rounded-3xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-500">Filter by Stock Level</span>
          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All stock levels</option>
            <option value="healthy">Healthy Stock (&gt; Threshold)</option>
            <option value="low">Low Stock (&le; Threshold)</option>
            <option value="out">Out of Stock (= 0)</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center p-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-rose-600">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState title="No products found" description="No products match your current search/filters." action={<Link to="/inventory/add"><Button>Add product</Button></Link>} />
        ) : (
          <>
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Saree</th>
                  <th className="px-5 py-4 font-semibold">Design</th>
                  <th className="px-5 py-4 font-semibold">Fabric</th>
                  <th className="px-5 py-4 font-semibold">Stock Level</th>
                  <th className="px-5 py-4 font-semibold text-right">Cost Price</th>
                  <th className="px-5 py-4 font-semibold text-right">Selling Price</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-900 font-medium capitalize">{product.saree_name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-900 capitalize">{product.design_name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-900 capitalize">{product.fabric_type ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{product.stock_quantity ?? 0}</span>
                        {product.stock_quantity === 0 ? (
                          <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                            Out of Stock
                          </span>
                        ) : product.stock_quantity <= (product.low_stock_threshold ?? 5) ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            Healthy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-900 text-right">₹{product.cost_price ?? 0}</td>
                    <td className="px-5 py-4 text-slate-900 text-right font-semibold">₹{product.selling_price ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {product.status ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/inventory/edit/${product.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit3 size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteConfirm(product.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-900">{filteredProducts.length}</span> entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
