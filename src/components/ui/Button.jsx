const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-300',
  secondary: 'bg-slate-50 text-slate-900 hover:bg-slate-100 focus:ring-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200',
}

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
