import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { createCustomer, deleteCustomer, fetchCustomers, getCustomerById, updateCustomer } from '../services/customerService'

export default function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchCustomers()
      setCustomers(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load customers')
      toast.error(err.message || 'Unable to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCustomer = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      await deleteCustomer(id)
      toast.success('Customer deleted successfully')
      await loadCustomers()
    } catch (err) {
      setError(err.message || 'Unable to delete customer')
      toast.error(err.message || 'Unable to delete customer')
    } finally {
      setLoading(false)
    }
  }, [loadCustomers])

  return {
    customers,
    loading,
    error,
    loadCustomers,
    removeCustomer,
    createCustomer,
    updateCustomer,
    getCustomerById,
  }
}
