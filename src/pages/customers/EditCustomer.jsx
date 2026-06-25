import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useCustomers from '../../hooks/useCustomers'

export default function EditCustomer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCustomerById, updateCustomer } = useCustomers()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!id) return

    const loadCustomer = async () => {
      setLoading(true)
      setFetchError(null)

      try {
        const record = await getCustomerById(id)
        reset(record)
      } catch (error) {
        setFetchError(error.message || 'Unable to load customer')
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [id, getCustomerById, reset])

  const onSubmit = async (values) => {
    try {
      await updateCustomer(id, values)
      navigate('/customers')
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner />
      </Card>
    )
  }

  if (fetchError) {
    return (
      <Card className="p-10 text-center text-slate-900">
        <p className="text-lg font-semibold">Unable to load customer</p>
        <p className="mt-2 text-sm text-rose-600">{fetchError}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Edit customer</h1>
          <p className="mt-2 text-sm text-slate-600">Update contact details, address and purchase preferences.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            {...register('full_name', { required: 'Name is required' })}
            error={errors.full_name?.message}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="Enter phone number"
            {...register('phone', { required: 'Phone is required' })}
            error={errors.phone?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          <Input
            label="Purchase Preference"
            placeholder="Favourite fabric or price range"
            {...register('purchase_preference')}
          />
          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Address
            <textarea
              {...register('address', { required: 'Address is required' })}
              rows="4"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              placeholder="Enter full address"
            />
            {errors.address && <p className="mt-2 text-xs text-rose-600">{errors.address.message}</p>}
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update customer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
