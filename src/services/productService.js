import { supabase } from './supabaseClient'

const table = 'products'

export async function fetchProducts() {
  const { data, error } = await supabase.from(table).select('*').order('updated_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function createProduct(product) {
  const { data, error } = await supabase.from(table).insert([product])
  if (error) {
    throw new Error(error.message)
  }
  return data?.[0]
}

export async function updateProduct(id, product) {
  const { data, error } = await supabase.from(table).update(product).eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  return data?.[0]
}

export async function deleteProduct(id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  return true
}
