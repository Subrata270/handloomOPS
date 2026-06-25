import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">404 error</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
