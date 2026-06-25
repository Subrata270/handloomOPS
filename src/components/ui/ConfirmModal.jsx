export default function ConfirmModal({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onCancel, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl shadow-slate-900/10">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
