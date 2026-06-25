import { supabase } from './supabaseClient'

const table = 'expenses'

export async function fetchExpenses() {
  const { data, error } = await supabase.from(table).select('*').order('expense_date', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getExpenseById(id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function createExpense(expense) {
  const { data, error } = await supabase.from(table).insert([expense]).select('*').single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateExpense(id, expense) {
  const { data, error } = await supabase.from(table).update(expense).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

export async function fetchExpensesByMonth(year, month) {
  const start = new Date(year, month - 1, 1).toISOString()
  const end = new Date(year, month, 1).toISOString()
  const { data, error } = await supabase.from(table).select('*').gte('expense_date', start).lt('expense_date', end)
  if (error) throw new Error(error.message)
  return data
}
