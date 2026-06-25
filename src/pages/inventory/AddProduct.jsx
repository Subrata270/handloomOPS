import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { createProduct } from '../../services/productService'

const defaultValues = {
  saree_name: '',
  design_name: '',
  fabric_type: '',
  colour: '',
  stock_quantity: 0,
  cost_price: 0,
  selling_price: 0,
  low_stock_threshold: 0,
  status: 'active',
}

export default function AddProduct() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        stock_quantity: Number(values.stock_quantity),
        cost_price: Number(values.cost_price),
        selling_price: Number(values.selling_price),
        low_stock_threshold: Number(values.low_stock_threshold),
      }

      await createProduct(payload)
      toast.success('Product added successfully')
      navigate('/inventory')
    } catch (error) {
      toast.error(error.message || 'Unable to add product')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Inventory</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Add new product</h2>
        <p className="mt-1 text-sm text-slate-600">Create saree entries with pricing, stock and status details.</p>
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
            {isSubmitting ? 'Saving...' : 'Save product'}
          </button>
        </div>
      </form>
    </div>
  )
}
