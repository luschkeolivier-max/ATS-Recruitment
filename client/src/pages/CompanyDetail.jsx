import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const STATUS_CLASS = { PROSPECT: 'badge-draft', ACTIVE: 'badge-open', INACTIVE: 'badge-closed' };
const JOB_STATUS_CLASS = { OPEN: 'badge-open', CLOSED: 'badge-closed', DRAFT: 'badge-draft' };
const PLACEMENT_STATUS_CLASS = { PENDING: 'badge-draft', INVOICED: 'badge-draft', PAID: 'badge-open' };

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  const load = async () => {
    try {
      const data = await api.get(`/companies/${companyId}`);
      setCompany(data.company);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this company? Jobs linked to it will keep their history but lose the link.')) return;
    await api.del(`/companies/${companyId}`);
    navigate('/companies');
  };

  if (error) return <div className="alert-error">{error}</div>;
  if (!company) return <div className="empty-state">Loading...</div>;

  const feeLabel = (p) =>
    p.feeType === 'PERCENTAGE' ? `${p.feePercentage ?? 0}% of salary` : `${p.currency} ${p.feeAmount ?? 0} flat`;

  return (
    <div>
      <div className="detail-header">
        <h1>{company.name}</h1>
        <div className="detail-meta">
          <span className={`badge ${STATUS_CLASS[company.status]}`}>{company.status}</span>
          {company.industry && <span>{company.industry}</span>}
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer">
              Website
            </a>
          )}
          {company.address && <span>{company.address}</span>}
        </div>
        {company.notes && <p style={{ marginTop: 12, color: '#374151' }}>{company.notes}</p>}
        {canManage && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={() => setShowAddContact(true)}>
              + Add contact
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              Delete company
            </button>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Contacts</h2>
        {company.contacts.length === 0 ? (
          <div className="empty-state">No contacts yet.</div>
        ) : (
          company.contacts.map((c) => (
            <div key={c.id} className="note-item">
              <div>
                <strong>{c.name}</strong>
                {c.title ? ` — ${c.title}` : ''}
                {c.isPrimary && <span className="tag" style={{ marginLeft: 8 }}>Primary</span>}
              </div>
              <div className="note-meta">
                {[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact details'}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <h2>Jobs</h2>
        {company.jobs.length === 0 ? (
          <div className="empty-state">No requisitions for this company yet.</div>
        ) : (
          <div className="card-list">
            {company.jobs.map((j) => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="list-card">
                <div>
                  <div className="list-card-title">{j.title}</div>
                  <div className="list-card-meta">{j._count.applications} application{j._count.applications === 1 ? '' : 's'}</div>
                </div>
                <span className={`badge ${JOB_STATUS_CLASS[j.status]}`}>{j.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Placements</h2>
        {company.placements.length === 0 ? (
          <div className="empty-state">No placements yet.</div>
        ) : (
          company.placements.map((p) => (
            <div key={p.id} className="note-item">
              <div>
                <Link to={`/applications/${p.application.id}`}>{p.application.candidate.name}</Link> →{' '}
                {p.application.job.title}
              </div>
              <div className="note-meta">
                Starts {new Date(p.startDate).toLocaleDateString()} · Fee: {feeLabel(p)} ·{' '}
                <span className={`badge ${PLACEMENT_STATUS_CLASS[p.status]}`}>{p.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddContact && (
        <AddContactModal
          companyId={companyId}
          onClose={() => setShowAddContact(false)}
          onAdded={() => {
            setShowAddContact(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddContactModal({ companyId, onClose, onAdded }) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/companies/${companyId}/contacts`, { name, title, email, phone, isPrimary });
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add contact" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Head of Talent" />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} style={{ width: 'auto' }} />
          Primary contact
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
