import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import useExpenses from '../../hooks/useExpenses'

export default function NewExpense() {
  const navigate = useNavigate()
  const { createExpense } = useExpenses()
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const exp = { category, title, amount: Number(amount || 0), expense_date: expenseDate || new Date().toISOString(), notes }
      await createExpense(exp)
      navigate('/expenses')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Expenses</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Add expense</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Supplies" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Expense title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Amount</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Expense date</label>
              <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional notes" />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save expense'}</Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
