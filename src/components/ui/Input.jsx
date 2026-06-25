export default function Input({ label, error, icon, className = '', ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="relative mt-2">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">{icon}</div>}
        <input
          className={`mt-0 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${icon ? 'pl-11' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </label>
  )
}
