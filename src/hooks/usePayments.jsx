import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import * as paymentsService from '../services/paymentsService'

export default function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await paymentsService.fetchPayments()
      setPayments(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load payments')
      toast.error(err.message || 'Unable to load payments')
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      return await paymentsService.getPaymentById(id)
    } catch (err) {
      setError(err.message || 'Unable to load payment receipt')
      toast.error(err.message || 'Unable to load payment receipt')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createPayment = useCallback(async (payment) => {
    setLoading(true)
    setError(null)
    try {
      const data = await paymentsService.createPayment(payment)
      toast.success('Payment recorded successfully')
      return data
    } catch (err) {
      setError(err.message || 'Unable to record payment')
      toast.error(err.message || 'Unable to record payment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePayment = useCallback(async (id, payment) => {
    setLoading(true)
    setError(null)
    try {
      const data = await paymentsService.updatePayment(id, payment)
      toast.success('Payment receipt updated successfully')
      return data
    } catch (err) {
      setError(err.message || 'Unable to update payment')
      toast.error(err.message || 'Unable to update payment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePayment = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await paymentsService.deletePayment(id)
      toast.success('Payment receipt deleted successfully')
    } catch (err) {
      setError(err.message || 'Unable to delete payment')
      toast.error(err.message || 'Unable to delete payment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPaymentsBySale = useCallback(async (saleId) => {
    setLoading(true)
    setError(null)
    try {
      return await paymentsService.fetchPaymentsBySale(saleId)
    } catch (err) {
      setError(err.message || 'Unable to load payments for sale')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    payments,
    loading,
    error,
    loadPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    fetchPaymentsBySale,
  }
}
