import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmModal from '../../components/ui/ConfirmModal'
import useExpenses from '../../hooks/useExpenses'
import { formatCurrency, formatDate } from '../../utils/format'

export default function ExpensesList() {
  const { expenses, loading, loadExpenses, deleteExpense } = useExpenses()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [currentDelete, setCurrentDelete] = useState(null)

  const handleDelete = async () => {
    if (!currentDelete) return
    await deleteExpense(currentDelete)
    setConfirmOpen(false)
    setCurrentDelete(null)
    loadExpenses()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Expenses</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Expenses</h1>
        </div>
        <div>
          <Link to="/expenses/new">
            <Button><Plus size={14} /> New expense</Button>
          </Link>
        </div>
      </div>

      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <EmptyState title="No expenses" description="Track business expenses here." action={<Link to="/expenses/new"><Button>New expense</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{e.category}</td>
                    <td className="px-5 py-4">{e.title}</td>
                    <td className="px-5 py-4">{formatCurrency(e.amount)}</td>
                    <td className="px-5 py-4">{formatDate(e.expense_date)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/expenses/edit/${e.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"> <Edit size={14} /> Edit</Link>
                        <button onClick={() => { setCurrentDelete(e.id); setConfirmOpen(true) }} className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"> <Trash2 size={14} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmModal open={confirmOpen} title="Delete expense" description="Are you sure you want to delete this expense?" onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
