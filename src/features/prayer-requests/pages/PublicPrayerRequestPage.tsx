import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSeo } from '@/lib/seo';

const API_URL = import.meta.env.VITE_API_URL;

interface PrayerCategory {
  id: string;
  name: string;
}

export function PublicPrayerRequestPage() {
  // Private intake link — must never appear in search results.
  useSeo({
    title: 'Submit a Prayer Request',
    description: 'Share a prayer request with the pastoral team.',
    noIndex: true,
  });

  const [categories, setCategories] = useState<PrayerCategory[]>([]);
  const [form, setForm] = useState({
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    categoryId: '',
    request: '',
    confidentialityLevel: 'STANDARD',
    wantsCall: false,
    wantsPastoralContact: false,
    consentToRetain: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/prayer-requests/public/categories`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.guestFirstName.trim()) e.guestFirstName = 'First name is required';
    if (!form.guestLastName.trim()) e.guestLastName = 'Last name is required';
    if (!form.request.trim()) e.request = 'Please share your prayer request';
    if (form.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      e.guestEmail = 'Please enter a valid email';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');

    try {
      const payload: Record<string, unknown> = {
        guestFirstName: form.guestFirstName.trim(),
        guestLastName: form.guestLastName.trim(),
        request: form.request.trim(),
        confidentialityLevel: form.confidentialityLevel,
        wantsCall: form.wantsCall,
        wantsPastoralContact: form.wantsPastoralContact,
        consentToRetain: form.consentToRetain,
      };
      if (form.guestEmail.trim()) payload.guestEmail = form.guestEmail.trim();
      if (form.guestPhone.trim()) payload.guestPhone = form.guestPhone.trim();
      if (form.categoryId) payload.categoryId = form.categoryId;

      await axios.post(`${API_URL}/prayer-requests/public`, payload);
      setSubmitted(true);
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function field(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Thank You!</h2>
          <p className="mb-6 text-slate-600">
            Your prayer request has been received. Our prayer team will be lifting you up in prayer.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                guestFirstName: '', guestLastName: '', guestEmail: '', guestPhone: '',
                categoryId: '', request: '', confidentialityLevel: 'STANDARD',
                wantsCall: false, wantsPastoralContact: false, consentToRetain: true,
              });
            }}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-7 w-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Prayer Request</h1>
          <p className="mt-1 text-sm text-slate-600">
            Share your prayer needs with us. Our prayer team is here for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          {serverError && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{serverError}</div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.guestFirstName}
                onChange={(e) => field('guestFirstName', e.target.value)}
                className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.guestFirstName ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-300 focus:ring-indigo-500/30'}`}
                placeholder="John"
              />
              {errors.guestFirstName && <p className="mt-1 text-xs text-rose-600">{errors.guestFirstName}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.guestLastName}
                onChange={(e) => field('guestLastName', e.target.value)}
                className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.guestLastName ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-300 focus:ring-indigo-500/30'}`}
                placeholder="Doe"
              />
              {errors.guestLastName && <p className="mt-1 text-xs text-rose-600">{errors.guestLastName}</p>}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.guestEmail}
                onChange={(e) => field('guestEmail', e.target.value)}
                className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.guestEmail ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-300 focus:ring-indigo-500/30'}`}
                placeholder="john@example.com"
              />
              {errors.guestEmail && <p className="mt-1 text-xs text-rose-600">{errors.guestEmail}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={form.guestPhone}
                onChange={(e) => field('guestPhone', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => field('categoryId', e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0"
              >
                <option value="">Select a category (optional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Your Prayer Request <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={form.request}
              onChange={(e) => field('request', e.target.value)}
              maxLength={5000}
              className={`w-full resize-y rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.request ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-300 focus:ring-indigo-500/30'}`}
              placeholder="Share what you would like us to pray about..."
            />
            {errors.request && <p className="mt-1 text-xs text-rose-600">{errors.request}</p>}
            <p className="mt-1 text-xs text-slate-400">{form.request.length}/5000</p>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Confidentiality</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'STANDARD', label: 'Share with prayer team' },
                { value: 'CONFIDENTIAL', label: 'Confidential' },
                { value: 'PASTOR_ONLY', label: 'Pastor only' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="confidentialityLevel"
                    value={opt.value}
                    checked={form.confidentialityLevel === opt.value}
                    onChange={(e) => field('confidentialityLevel', e.target.value)}
                    className="accent-indigo-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.wantsCall}
                onChange={(e) => field('wantsCall', e.target.checked)}
                className="accent-indigo-600"
              />
              I would like someone to call me
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.wantsPastoralContact}
                onChange={(e) => field('wantsPastoralContact', e.target.checked)}
                className="accent-indigo-600"
              />
              I would like to speak with a pastor
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Prayer Request'
            )}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Your prayer request is encrypted and handled with care.
          </p>
        </form>
      </div>
    </div>
  );
}
