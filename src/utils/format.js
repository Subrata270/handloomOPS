const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export function formatCurrency(value) {
  const amount = Number(value) || 0
  return currencyFormatter.format(amount)
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
