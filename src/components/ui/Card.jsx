export default function Card({ title, subtitle, children, className = '', ...props }) {
  return (
    <section className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
