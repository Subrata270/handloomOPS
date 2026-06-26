import { useEffect, useState } from 'react'
import { getSettings, saveSettings } from '../../services/settingsService'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Settings() {
  const [settings, setSettings] = useState({
    businessName: '',
    ownerName: '',
    logo: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    termsAndConditions: '',
  })

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings(settings)
    toast.success('Business settings saved successfully!')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Configuration</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Business settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure Sri Mahalakshmi Handlooms details. These values appear automatically on invoice templates and generated PDFs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Company Details</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
              <Input
                value={settings.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="e.g. Sri Mahalakshmi Handlooms"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Owner Name</label>
              <Input
                value={settings.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                placeholder="e.g. Subrata Sahu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <Input
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. info@mahalakshmihandlooms.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">GSTIN</label>
              <Input
                value={settings.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                placeholder="e.g. 21AAAAA1111A1Z1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL (Optional)</label>
              <Input
                value={settings.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                placeholder="e.g. https://example.com/logo.png"
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Addresses & Disclaimers</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows="3"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Full physical address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Terms & Conditions</label>
              <textarea
                value={settings.termsAndConditions}
                onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                rows="4"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Terms listed at bottom of invoices"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  )
}
