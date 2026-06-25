const stats = [
  { label: 'Total Products', value: '1,280', description: 'All saree inventory across collections' },
  { label: 'Total Customers', value: '320', description: 'Active retail and wholesale clients' },
  { label: 'Monthly Revenue', value: '₹120,000', description: 'Expected revenue for the current month' },
  { label: 'Outstanding Dues', value: '₹28,450', description: 'Pending payments from orders' },
  { label: 'Low Stock Items', value: '18', description: 'Products that need restocking soon' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Handloom Inventory</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-900">Welcome to your admin dashboard</h2>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Last updated just now
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {stats.map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <h3 className="text-base font-semibold text-slate-900">Inventory summary</h3>
          <p className="mt-3 text-sm text-slate-600">A clean overview of your product catalogue and stock signals. The system is ready to connect to the Supabase inventory table.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <h3 className="text-base font-semibold text-slate-900">Customer engagement</h3>
          <p className="mt-3 text-sm text-slate-600">Placeholder cards keep the dashboard polished while your CRM flows are built next.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <h3 className="text-base font-semibold text-slate-900">Action center</h3>
          <p className="mt-3 text-sm text-slate-600">Use the left navigation to manage products, sales, and financial summaries.</p>
        </div>
      </section>
    </div>
  )
}
