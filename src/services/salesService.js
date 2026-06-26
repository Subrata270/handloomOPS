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

export async function getNextInvoiceNumber() {
  const currentYear = new Date().getFullYear()
  const prefix = `SMH-${currentYear}-`
  
  const { data, error } = await supabase
    .from(salesTable)
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return `${prefix}000001`
  }

  const lastInvoice = data[0].invoice_number
  const parts = lastInvoice.split('-')
  if (parts.length < 3) {
    return `${prefix}000001`
  }
  
  const lastNum = parseInt(parts[2], 10)
  if (isNaN(lastNum)) {
    return `${prefix}000001`
  }
  
  const nextNum = lastNum + 1
  const paddedNum = String(nextNum).padStart(6, '0')
  return `${prefix}${paddedNum}`
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

  // Insert Sale
  const { data: saleData, error: saleError } = await supabase.from(salesTable).insert([sale]).select('id').single()
  if (saleError) {
    throw new Error(saleError.message)
  }

  const saleId = saleData.id

  try {
    const saleItems = items.map((item) => ({
      sale_id: saleId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total,
    }))

    // Insert Items
    const { error: itemsError } = await supabase.from(saleItemsTable).insert(saleItems)
    if (itemsError) {
      throw new Error(itemsError.message)
    }

    // Update Stock
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
  } catch (err) {
    // Transactional Rollback
    await supabase.from(salesTable).delete().eq('id', saleId)
    throw err
  }
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
