import { useEffect, useState } from 'react'
import * as expensesService from '../services/expensesService'

export default function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const data = await expensesService.fetchExpenses()
      setExpenses(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      setLoading(true)
      try {
        const data = await expensesService.fetchExpenses()
        if (active) setExpenses(data)
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
    expenses,
    loading,
    loadExpenses,
    getExpenseById: expensesService.getExpenseById,
    createExpense: expensesService.createExpense,
    updateExpense: expensesService.updateExpense,
    deleteExpense: expensesService.deleteExpense,
    fetchExpensesByMonth: expensesService.fetchExpensesByMonth,
  }
}
