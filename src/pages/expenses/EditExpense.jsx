import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import useExpenses from '../../hooks/useExpenses'

export default function EditExpense() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getExpenseById, updateExpense } = useExpenses()
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const e = await getExpenseById(id)
        setExpense(e)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, getExpenseById])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateExpense(id, expense)
      navigate('/expenses')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Card className="p-6">Loading...</Card>

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <Input value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <Input value={expense.title} onChange={(e) => setExpense({ ...expense, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Amount</label>
            <Input type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Expense date</label>
            <Input type="date" value={expense.expense_date?.slice(0,10) || ''} onChange={(e) => setExpense({ ...expense, expense_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <Input value={expense.notes || ''} onChange={(e) => setExpense({ ...expense, notes: e.target.value })} />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Card>
    </form>
  )
}
