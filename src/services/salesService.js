import { supabase } from './supabaseClient'

const salesTable = 'sales'
const saleItemsTable = 'sale_items'
const productsTable = 'products'

export async function fetchSales() {
  const { data, error } = await supabase.from(salesTable).select('*').order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function getSaleById(id) {
  const { data, error } = await supabase.from(salesTable).select('*').eq('id', id).single()
  if (error) {
    throw new Error(error.message)
  }

  const { data: items, error: itemError } = await supabase
    .from(saleItemsTable)
    .select('*')
    .eq('sale_id', id)

  if (itemError) {
    throw new Error(itemError.message)
  }

  const productIds = items.map((item) => item.product_id).filter(Boolean)
  const { data: products } = await supabase.from(productsTable).select('id, saree_name').in('id', productIds)

  const enrichedItems = items.map((item) => ({
    ...item,
    product: products?.find((product) => product.id === item.product_id) ?? null,
  }))

  return { ...data, items: enrichedItems }
}

export async function getSaleByInvoiceNumber(invoiceNumber) {
  if (!invoiceNumber) {
    throw new Error('Invoice number is required')
  }

  const { data, error } = await supabase
    .from(salesTable)
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createSale(sale, items) {
  if (!sale.customer_id) {
    throw new Error('Customer is required')
  }
  if (!items.length) {
    throw new Error('Add at least one product to the sale')
  }

  const productIds = items.map((item) => item.product_id)
  const { data: products, error: productError } = await supabase
    .from(productsTable)
    .select('id, stock_quantity')
    .in('id', productIds)

  if (productError) {
    throw new Error(productError.message)
  }

  const stockMap = Object.fromEntries(products.map((product) => [product.id, product.stock_quantity]))

  for (const item of items) {
    const stock = stockMap[item.product_id] ?? 0
    if (item.quantity > stock) {
      throw new Error(`Insufficient stock for ${item.product_name || 'a product'}`)
    }
  }

  const { data: saleData, error: saleError } = await supabase.from(salesTable).insert([sale]).select('id').single()
  if (saleError) {
    throw new Error(saleError.message)
  }

  const saleItems = items.map((item) => ({
    sale_id: saleData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total,
  }))

  const { error: itemsError } = await supabase.from(saleItemsTable).insert(saleItems)
  if (itemsError) {
    throw new Error(itemsError.message)
  }

  for (const item of items) {
    const newStock = (stockMap[item.product_id] ?? 0) - item.quantity
    const { error: updateError } = await supabase
      .from(productsTable)
      .update({ stock_quantity: newStock })
      .eq('id', item.product_id)

    if (updateError) {
      throw new Error(updateError.message)
    }
  }

  return saleData
}

export async function fetchSaleItems(saleId) {
  const { data, error } = await supabase.from(saleItemsTable).select('*').eq('sale_id', saleId)
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function fetchSalesByCustomer(customerId) {
  const { data, error } = await supabase.from(salesTable).select('*').eq('customer_id', customerId).order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data
}
