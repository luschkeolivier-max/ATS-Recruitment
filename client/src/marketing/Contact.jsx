import { useState } from 'react';
import { api } from '../api/client';
import { PageHero } from './parts';

const EMPTY = { name: '', companyName: '', email: '', phone: '', rolesNeeded: '', headcount: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/public/inquiries', form);
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Request talent"
        text="Tell us about the roles you're hiring for. A member of the Voltra Global team will be in touch."
      />
      <section className="mk-section">
        <div className="mk-container mk-narrow">
          {sent ? (
            <div className="mk-success" role="status">
              <h2>Thanks, we've got your request.</h2>
              <p>We'll review the details and get back to you by email.</p>
            </div>
          ) : (
            <form className="mk-form" onSubmit={handleSubmit}>
              {error && <div className="alert-error" role="alert">{error}</div>}
              <div className="mk-form-row">
                <label>
                  Your name
                  <input value={form.name} onChange={set('name')} required />
                </label>
                <label>
                  Company
                  <input value={form.companyName} onChange={set('companyName')} required />
                </label>
              </div>
              <div className="mk-form-row">
                <label>
                  Work email
                  <input type="email" value={form.email} onChange={set('email')} required />
                </label>
                <label>
                  Phone (optional)
                  <input value={form.phone} onChange={set('phone')} />
                </label>
              </div>
              <div className="mk-form-row">
                <label>
                  Roles you need
                  <input
                    value={form.rolesNeeded}
                    onChange={set('rolesNeeded')}
                    placeholder="e.g. Customer support agents"
                    required
                  />
                </label>
                <label>
                  How many people?
                  <input value={form.headcount} onChange={set('headcount')} placeholder="e.g. 3" />
                </label>
              </div>
              <label>
                Anything else we should know?
                <textarea rows={5} value={form.message} onChange={set('message')} />
              </label>
              <button className="mk-btn mk-btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send request'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
