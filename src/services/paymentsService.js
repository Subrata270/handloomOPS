import { supabase } from './supabaseClient'
import * as salesService from './salesService'

const table = 'payments'
const salesTable = 'sales'

async function updateSalePaymentStatus(saleId) {
  if (!saleId) return
  const { data: payments, error: paymentsError } = await supabase.from(table).select('amount').eq('sale_id', saleId)
  if (paymentsError) throw new Error(paymentsError.message)

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  const sale = await salesService.getSaleById(saleId)
  const total = Number(sale.total || sale.total_amount || 0)

  let status
  if (totalPaid <= 0) status = 'Pending'
  else if (totalPaid >= total) status = 'Paid'
  else status = 'Partial'

  const { error: updateError } = await supabase.from(salesTable).update({ payment_status: status }).eq('id', saleId)
  if (updateError) throw new Error(updateError.message)
}

export async function fetchPayments() {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getPaymentById(id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
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
  const { data, error } = await supabase.from(table).insert([payment]).select('*').single()
  if (error) throw new Error(error.message)
  await updateSalePaymentStatus(payment.sale_id)
  return data
}

export async function updatePayment(id, payment) {
  const { data: existing, error: getError } = await supabase.from(table).select('*').eq('id', id).single()
  if (getError) throw new Error(getError.message)
  const { data, error } = await supabase.from(table).update(payment).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  await updateSalePaymentStatus(existing.sale_id)
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
