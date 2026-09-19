import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import Brand from '../components/Brand';
import Modal from '../components/Modal';

export default function CandidateShowcase() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    api
      .get(`/public/candidates/${candidateId}/showcase`)
      .then((data) => setCandidate(data.candidate))
      .catch((err) => setError(err.message));
  }, [candidateId]);

  if (error) return <div className="empty-state">{error}</div>;
  if (!candidate) return <div className="empty-state">Loading...</div>;

  return (
    <div className="showcase-page">
      <div className="showcase-topbar">
        <Brand />
      </div>
      <main className="showcase-content">
        <div className="detail-header">
          <h1>{candidate.firstName}</h1>
          <div className="detail-meta">
            <span>Candidate profile shared for your review</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setShowRequest(true)}>
              Request an interview
            </button>
          </div>
        </div>

        {candidate.videoIntroUrl && (
          <div className="section">
            <h2>Video introduction</h2>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={candidate.videoIntroUrl}
              controls
              style={{ width: '100%', maxWidth: 480, borderRadius: 8 }}
            />
          </div>
        )}

        {candidate.summary && (
          <div className="section">
            <h2>Summary</h2>
            <p style={{ margin: 0, fontSize: 14 }}>{candidate.summary}</p>
          </div>
        )}

        {candidate.skills?.length > 0 && (
          <div className="section">
            <h2>Skills and tools</h2>
            {candidate.skills.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>
        )}

        {candidate.achievements?.length > 0 && (
          <div className="section">
            <h2>Achievements</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {candidate.achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="section">
          <h2>Redacted resume</h2>
          {candidate.redactedResumeText ? (
            <pre className="redacted-resume">{candidate.redactedResumeText}</pre>
          ) : (
            <div className="empty-state">Not available yet.</div>
          )}
        </div>
      </main>

      {showRequest && (
        <InterviewRequestModal candidateId={candidateId} onClose={() => setShowRequest(false)} />
      )}
    </div>
  );
}

function minScheduleValue() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000 + 5 * 60 * 1000); // 24h + 5min buffer
  d.setSeconds(0, 0);
  return d;
}

function InterviewRequestModal({ candidateId, onClose }) {
  const min = minScheduleValue();
  const [requesterName, setRequesterName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [date, setDate] = useState(min.toISOString().slice(0, 10));
  const [time, setTime] = useState(min.toISOString().slice(11, 16));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt < min) {
      setError('Interviews require at least 24 hours’ notice — pick a later date or time.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/public/candidates/${candidateId}/interview-requests`, {
        requesterName,
        companyName,
        requesterEmail,
        roleTitle,
        scheduledAt: scheduledAt.toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Modal title="Request sent" onClose={onClose}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Thanks — the agency will confirm your interview request shortly.
        </p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Request an interview" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name and Surname
          <input value={requesterName} onChange={(e) => setRequesterName(e.target.value)} required />
        </label>
        <label>
          Company name
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </label>
        <label>
          Email address
          <input
            type="email"
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Position / Role interviewing for
          <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} required />
        </label>
        <div className="two-col-fields">
          <label>
            Date of interview
            <input
              type="date"
              value={date}
              min={min.toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Time of interview
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
        </div>
        <span className="field-hint">Interviews require at least 24 hours' notice.</span>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
