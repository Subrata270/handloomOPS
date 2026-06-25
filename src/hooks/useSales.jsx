import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  createSale,
  fetchSaleItems,
  fetchSales,
  fetchSalesByCustomer,
  getSaleById,
} from '../services/salesService'

export default function useSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSales = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchSales()
      setSales(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load sales')
      toast.error(err.message || 'Unable to load sales')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitSale = useCallback(async (sale, items) => {
    setLoading(true)
    setError(null)

    try {
      const result = await createSale(sale, items)
      toast.success('Sale saved successfully')
      return result
    } catch (err) {
      setError(err.message || 'Unable to save sale')
      toast.error(err.message || 'Unable to save sale')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSalesByCustomer = useCallback(async (customerId) => {
    setLoading(true)
    setError(null)

    try {
      return await fetchSalesByCustomer(customerId)
    } catch (err) {
      setError(err.message || 'Unable to load customer history')
      toast.error(err.message || 'Unable to load customer history')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    sales,
    loading,
    error,
    loadSales,
    loadSalesByCustomer,
    submitSale,
    getSaleById,
    fetchSaleItems,
  }
}
