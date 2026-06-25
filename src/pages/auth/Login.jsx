import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/useAuth'

export default function Login() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password)
    if (result?.user) {
      reset()
      navigate('/dashboard', { replace: true })
    } else {
      toast.error('Please check your email and password')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/80">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Sri Mahalakshmi Handlooms</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Secure access for inventory and CRM management.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              {...register('email', { required: 'Email is required' })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            {errors.email && <p className="mt-2 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            {errors.password && <p className="mt-2 text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Use the admin credentials configured in Supabase. Signup is not available in this portal.
        </div>
      </div>
    </div>
  )
}
