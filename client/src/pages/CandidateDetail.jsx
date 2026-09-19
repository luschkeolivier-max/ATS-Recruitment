import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');
  const [showApply, setShowApply] = useState(false);

  const load = async () => {
    try {
      const data = await api.get(`/candidates/${candidateId}`);
      setCandidate(data.candidate);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this candidate? This cannot be undone.')) return;
    await api.del(`/candidates/${candidateId}`);
    navigate('/candidates');
  };

  if (error) return <div className="alert-error">{error}</div>;
  if (!candidate) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="detail-header">
        <h1>{candidate.name}</h1>
        <div className="detail-meta">
          <span>{candidate.email}</span>
          {candidate.phone && <span>Contact: {candidate.phone}</span>}
          {candidate.whatsapp && <span>WhatsApp: {candidate.whatsapp}</span>}
          {candidate.source && <span>Source: {candidate.source}</span>}
          {candidate.linkedinUrl && (
            <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
          {candidate.resumeUrl && (
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
              Resume
            </a>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          {candidate.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        {canManage && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={() => setShowApply(true)}>
              + Apply to job
            </button>
            <a
              className="btn-secondary"
              href={`/candidates/${candidateId}/showcase`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              View client showcase link
            </a>
            <button className="btn-danger" onClick={handleDelete}>
              Delete candidate
            </button>
          </div>
        )}
      </div>

      {candidate.videoIntroUrl && (
        <div className="section">
          <h2>Video introduction</h2>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={candidate.videoIntroUrl} controls style={{ width: '100%', maxWidth: 480, borderRadius: 8 }} />
        </div>
      )}

      {(candidate.resumeSummary || candidate.resumeSkills?.length > 0 || candidate.resumeAchievements?.length > 0) && (
        <div className="section">
          <h2>From their resume</h2>
          {candidate.resumeSummary && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Summary
              </div>
              <p style={{ margin: 0, fontSize: 14 }}>{candidate.resumeSummary}</p>
            </div>
          )}
          {candidate.resumeSkills?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Tools and skills
              </div>
              {candidate.resumeSkills.map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
            </div>
          )}
          {candidate.resumeAchievements?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Achievements
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                {candidate.resumeAchievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="section">
        <h2>Applications</h2>
        {candidate.applications.length === 0 ? (
          <div className="empty-state">Not applied to any jobs yet.</div>
        ) : (
          <div className="card-list">
            {candidate.applications.map((app) => (
              <Link key={app.id} to={`/applications/${app.id}`} className="list-card">
                <div>
                  <div className="list-card-title">{app.job.title}</div>
                  <div className="list-card-meta">Job status: {app.job.status}</div>
                </div>
                <span className="badge">{app.stage}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showApply && (
        <ApplyModal
          candidateId={candidateId}
          existingJobIds={candidate.applications.map((a) => a.jobId)}
          onClose={() => setShowApply(false)}
          onApplied={() => {
            setShowApply(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ApplyModal({ candidateId, existingJobIds, onClose, onApplied }) {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/jobs?status=OPEN')
      .then((data) => {
        const available = data.jobs.filter((j) => !existingJobIds.includes(j.id));
        setJobs(available);
        if (available.length > 0) setJobId(available[0].id);
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/applications', { candidateId, jobId });
      onApplied();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Apply candidate to job" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        {jobs.length === 0 ? (
          <div className="empty-state">No open jobs available to apply to.</div>
        ) : (
          <label>
            Job
            <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || jobs.length === 0}>
            {submitting ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
