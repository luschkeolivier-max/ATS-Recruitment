import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Brand from '../components/Brand';

export default function ApplyProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [resume, setResume] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resume) return setError('Please attach your updated resume (PDF).');
    if (!video) return setError('Please attach your video introduction.');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('linkedinUrl', linkedinUrl);
    formData.append('whatsapp', whatsapp);
    formData.append('resume', resume);
    formData.append('video', video);

    setSubmitting(true);
    try {
      await api.postForm('/public/candidates', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Brand size="lg" />
          <h1>Thanks for applying!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            We've received your profile, resume, and video introduction. A recruiter will review
            it and reach out if there's a match.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page auth-page-wide">
      <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
        <Brand size="lg" />
        <h1>Create your candidate profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: -8 }}>
          Tell us about yourself so recruiters can match you to open roles.
        </p>
        {error && <div className="alert-error">{error}</div>}

        <div className="two-col-fields">
          <label>
            Name and Surname
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email address
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>

        <div className="two-col-fields">
          <label>
            Contact number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27 12 345 6789"
              required
            />
          </label>
          <label>
            WhatsApp number
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+27 12 345 6789"
              required
            />
          </label>
        </div>

        <label>
          LinkedIn profile link
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            required
          />
        </label>

        <label>
          Updated resume (PDF)
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            required
          />
          <span className="field-hint">We'll automatically pull a summary, skills, and achievements from it.</span>
        </label>

        <label>
          Video introduction
          <span className="field-hint">Record a short video answering:</span>
          <ol className="question-list">
            <li>Your work experience over the past 5 years</li>
            <li>Tools and systems you've used</li>
            <li>Your industry experience</li>
          </ol>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit profile'}
        </button>
        <p className="auth-switch">
          Recruiter or interviewer? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
