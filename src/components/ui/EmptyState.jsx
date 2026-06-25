export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-200 text-slate-500">
        {icon ? icon : <span className="text-xl">🙂</span>}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
