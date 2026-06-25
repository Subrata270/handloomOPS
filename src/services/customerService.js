import { supabase } from './supabaseClient'

const table = 'customers'

export async function fetchCustomers() {
  const { data, error } = await supabase.from(table).select('*').order('full_name', { ascending: true })
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function getCustomerById(id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function createCustomer(customer) {
  const { data, error } = await supabase.from(table).insert([customer])
  if (error) {
    throw new Error(error.message)
  }
  return data?.[0]
}

export async function updateCustomer(id, customer) {
  const { data, error } = await supabase.from(table).update(customer).eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  return data?.[0]
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  return true
}
