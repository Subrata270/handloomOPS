import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { getProductById, updateProduct } from '../../services/productService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!id) return

    const loadProduct = async () => {
      setLoadingProduct(true)
      setFetchError(null)

      try {
        const product = await getProductById(id)
        reset({
          saree_name: product.saree_name,
          design_name: product.design_name,
          fabric_type: product.fabric_type,
          colour: product.colour,
          stock_quantity: product.stock_quantity,
          cost_price: product.cost_price,
          selling_price: product.selling_price,
          low_stock_threshold: product.low_stock_threshold,
          status: product.status,
        })
      } catch (error) {
        setFetchError(error.message || 'Unable to load product')
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProduct()
  }, [id, reset])

  const onSubmit = async (values) => {
    try {
      await updateProduct(id, {
        ...values,
        stock_quantity: Number(values.stock_quantity),
        cost_price: Number(values.cost_price),
        selling_price: Number(values.selling_price),
        low_stock_threshold: Number(values.low_stock_threshold),
      })

      toast.success('Product updated successfully')
      navigate('/inventory')
    } catch (error) {
      toast.error(error.message || 'Unable to update product')
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm shadow-slate-200/50">
        <LoadingSpinner />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-slate-900">
        <p className="text-lg font-semibold">Unable to load product</p>
        <p className="mt-2 text-sm text-rose-700">{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Inventory</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Edit product</h2>
        <p className="mt-1 text-sm text-slate-600">Update saree details, pricing, and stock thresholds.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Saree Name
          <input
            type="text"
            {...register('saree_name', { required: 'Saree name is required' })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.saree_name && <p className="text-xs text-rose-600">{errors.saree_name.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Design Name
          <input
            type="text"
            {...register('design_name', { required: 'Design name is required' })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.design_name && <p className="text-xs text-rose-600">{errors.design_name.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Fabric Type
          <input
            type="text"
            {...register('fabric_type', { required: 'Fabric type is required' })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.fabric_type && <p className="text-xs text-rose-600">{errors.fabric_type.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Colour
          <input
            type="text"
            {...register('colour', { required: 'Colour is required' })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.colour && <p className="text-xs text-rose-600">{errors.colour.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Stock Quantity
          <input
            type="number"
            {...register('stock_quantity', { required: 'Stock quantity is required', min: { value: 0, message: 'Stock must be 0 or above' } })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.stock_quantity && <p className="text-xs text-rose-600">{errors.stock_quantity.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Cost Price
          <input
            type="number"
            step="0.01"
            {...register('cost_price', { required: 'Cost price is required', min: { value: 0, message: 'Cost must be 0 or above' } })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.cost_price && <p className="text-xs text-rose-600">{errors.cost_price.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Selling Price
          <input
            type="number"
            step="0.01"
            {...register('selling_price', { required: 'Selling price is required', min: { value: 0, message: 'Price must be 0 or above' } })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.selling_price && <p className="text-xs text-rose-600">{errors.selling_price.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Low Stock Threshold
          <input
            type="number"
            {...register('low_stock_threshold', { required: 'Threshold is required', min: { value: 0, message: 'Threshold must be 0 or above' } })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          {errors.low_stock_threshold && <p className="text-xs text-rose-600">{errors.low_stock_threshold.message}</p>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Status
          <select
            {...register('status', { required: 'Status is required' })}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <p className="text-xs text-rose-600">{errors.status.message}</p>}
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating...' : 'Update product'}
          </button>
        </div>
      </form>
    </div>
  )
}
