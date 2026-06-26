import { supabase } from './supabaseClient'

const table = 'payments'
const salesTable = 'sales'

async function updateSalePaymentStatus(saleId) {
  if (!saleId) return
  const { data: payments, error: paymentsError } = await supabase.from(table).select('amount').eq('sale_id', saleId)
  if (paymentsError) throw new Error(paymentsError.message)

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  const { data: sale, error: saleError } = await supabase.from(salesTable).select('total_amount').eq('id', saleId).single()
  if (saleError) throw new Error(saleError.message)
  
  const total = Number(sale.total_amount || 0)

  let status
  if (totalPaid <= 0) status = 'Pending'
  else if (totalPaid >= total - 0.01) status = 'Paid'
  else status = 'Partial'

  const { error: updateError } = await supabase.from(salesTable).update({ payment_status: status }).eq('id', saleId)
  if (updateError) throw new Error(updateError.message)
}

export async function fetchPayments() {
  const { data, error } = await supabase.from(table).select('*, sales(invoice_number, total_amount, customer_id, payment_status)').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getPaymentById(id) {
  const { data, error } = await supabase.from(table).select('*, sales(invoice_number, total_amount, customer_id, payment_status)').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function fetchPaymentsBySale(saleId) {
  const { data, error } = await supabase.from(table).select('*').eq('sale_id', saleId).order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function createPayment(payment) {
  if (!payment.sale_id) throw new Error('Sale reference is required')

  // Fetch sale total
  const { data: sale, error: saleError } = await supabase.from('sales').select('total_amount').eq('id', payment.sale_id).single()
  if (saleError) throw new Error(saleError.message)

  // Fetch existing payments
  const { data: payments, error: paymentsError } = await supabase.from(table).select('amount').eq('sale_id', payment.sale_id)
  if (paymentsError) throw new Error(paymentsError.message)

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const remainingDue = Number(sale.total_amount || 0) - totalPaid

  if (Number(payment.amount || 0) > remainingDue + 0.01) {
    throw new Error(`Payment exceeds outstanding due. Remaining due: ₹${remainingDue.toFixed(2)}`)
  }

  const { data, error } = await supabase.from(table).insert([payment]).select('*').single()
  if (error) throw new Error(error.message)
  await updateSalePaymentStatus(payment.sale_id)
  return data
}

export async function updatePayment(id, payment) {
  const { data: existing, error: getError } = await supabase.from(table).select('*').eq('id', id).single()
  if (getError) throw new Error(getError.message)
  const saleId = existing.sale_id

  // Fetch sale total
  const { data: sale, error: saleError } = await supabase.from('sales').select('total_amount').eq('id', saleId).single()
  if (saleError) throw new Error(saleError.message)

  // Fetch other payments for this sale (excluding this payment)
  const { data: payments, error: paymentsError } = await supabase.from(table).select('amount').eq('sale_id', saleId).not('id', 'eq', id)
  if (paymentsError) throw new Error(paymentsError.message)

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const remainingDue = Number(sale.total_amount || 0) - totalPaid

  if (Number(payment.amount || 0) > remainingDue + 0.01) {
    throw new Error(`Payment exceeds outstanding due. Remaining due: ₹${remainingDue.toFixed(2)}`)
  }

  const { data, error } = await supabase.from(table).update(payment).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  await updateSalePaymentStatus(saleId)
  return data
}

export async function deletePayment(id) {
  const { data: existing, error: getError } = await supabase.from(table).select('*').eq('id', id).single()
  if (getError) throw new Error(getError.message)
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
  await updateSalePaymentStatus(existing.sale_id)
  return true
}
