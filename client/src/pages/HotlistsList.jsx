import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function HotlistsList() {
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [hotlists, setHotlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/hotlists');
      setHotlists(data.hotlists);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Hotlists</h1>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Hotlist
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : hotlists.length === 0 ? (
        <div className="empty-state">No hotlists yet. Create one to start saving shortlists of candidates.</div>
      ) : (
        <div className="card-list">
          {hotlists.map((h) => (
            <Link key={h.id} to={`/hotlists/${h.id}`} className="list-card">
              <div>
                <div className="list-card-title">{h.name}</div>
                <div className="list-card-meta">
                  {h.description || 'No description'} · {h._count.members} candidate{h._count.members === 1 ? '' : 's'} ·
                  by {h.createdBy.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <HotlistFormModal
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

function HotlistFormModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/hotlists', { name, description });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New hotlist" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Top Go engineers" required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create hotlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
