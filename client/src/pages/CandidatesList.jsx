import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function CandidatesList() {
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const data = await api.get(`/candidates?${params.toString()}`);
      setCandidates(data.candidates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <div className="page-header">
        <h1>Candidates</h1>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Candidate
          </button>
        )}
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">No candidates found.</div>
      ) : (
        <div className="card-list">
          {candidates.map((c) => (
            <Link key={c.id} to={`/candidates/${c.id}`} className="list-card">
              <div>
                <div className="list-card-title">{c.name}</div>
                <div className="list-card-meta">
                  {c.email}
                  {c.source ? ` · ${c.source}` : ''} · {c._count.applications} application
                  {c._count.applications === 1 ? '' : 's'}
                </div>
                <div style={{ marginTop: 6 }}>
                  {c.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CandidateFormModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CandidateFormModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/candidates', {
        name,
        email,
        phone,
        resumeUrl,
        source,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New candidate" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Resume URL
          <input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
        </label>
        <label>
          Source
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. LinkedIn, referral"
          />
        </label>
        <label>
          Tags (comma separated)
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="python, senior" />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create candidate'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
