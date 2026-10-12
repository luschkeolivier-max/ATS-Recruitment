import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const STATUS_CLASS = { PROSPECT: 'badge-draft', ACTIVE: 'badge-open', INACTIVE: 'badge-closed' };

export default function CompaniesList() {
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await api.get(`/companies?${params.toString()}`);
      setCompanies(data.companies);
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
  }, [search, status]);

  return (
    <div>
      <div className="page-header">
        <h1>Companies</h1>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Company
          </button>
        )}
      </div>

      <div className="toolbar">
        <input placeholder="Search by name or industry..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PROSPECT">Prospect</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="empty-state">No companies yet.</div>
      ) : (
        <div className="card-list">
          {companies.map((c) => (
            <Link key={c.id} to={`/companies/${c.id}`} className="list-card">
              <div>
                <div className="list-card-title">{c.name}</div>
                <div className="list-card-meta">
                  {c.industry || 'No industry set'} · {c._count.jobs} job{c._count.jobs === 1 ? '' : 's'} ·{' '}
                  {c._count.contacts} contact{c._count.contacts === 1 ? '' : 's'} · {c._count.placements} placement
                  {c._count.placements === 1 ? '' : 's'}
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CompanyFormModal
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

function CompanyFormModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('PROSPECT');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/companies', { name, industry, website, address, status, notes });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New company" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Industry
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </label>
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </label>
        <label>
          Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PROSPECT">Prospect</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create company'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
