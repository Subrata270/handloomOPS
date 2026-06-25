import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import usePayments from '../../hooks/usePayments'

export default function EditPayment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPaymentById, updatePayment } = usePayments()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getPaymentById(id)
        setPayment(p)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, getPaymentById])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updatePayment(id, payment)
      navigate(`/payments/${id}`)
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
            <label className="block text-sm font-medium text-slate-700">Amount</label>
            <Input type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Payment date</label>
            <Input type="date" value={payment.payment_date?.slice(0,10) || ''} onChange={(e) => setPayment({ ...payment, payment_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Note</label>
            <Input value={payment.note || ''} onChange={(e) => setPayment({ ...payment, note: e.target.value })} />
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
