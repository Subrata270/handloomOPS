import { useEffect, useState } from 'react'
import * as paymentsService from '../services/paymentsService'

export default function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await paymentsService.fetchPayments()
      setPayments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      setLoading(true)
      try {
        const data = await paymentsService.fetchPayments()
        if (active) setPayments(data)
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [])

  return {
    payments,
    loading,
    loadPayments,
    getPaymentById: paymentsService.getPaymentById,
    createPayment: paymentsService.createPayment,
    updatePayment: paymentsService.updatePayment,
    deletePayment: paymentsService.deletePayment,
    fetchPaymentsBySale: paymentsService.fetchPaymentsBySale,
  }
}
