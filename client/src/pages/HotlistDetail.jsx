import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HotlistDetail() {
  const { hotlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [hotlist, setHotlist] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.get(`/hotlists/${hotlistId}`);
      setHotlist(data.hotlist);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotlistId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this hotlist? Candidates themselves are not affected.')) return;
    await api.del(`/hotlists/${hotlistId}`);
    navigate('/hotlists');
  };

  const removeMember = async (candidateId) => {
    await api.del(`/hotlists/${hotlistId}/members/${candidateId}`);
    load();
  };

  if (error) return <div className="alert-error">{error}</div>;
  if (!hotlist) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="detail-header">
        <h1>{hotlist.name}</h1>
        <div className="detail-meta">
          <span>{hotlist.members.length} candidate{hotlist.members.length === 1 ? '' : 's'}</span>
          <span>Created by {hotlist.createdBy.name}</span>
        </div>
        {hotlist.description && <p style={{ marginTop: 12, color: '#374151' }}>{hotlist.description}</p>}
        {canManage && (
          <div style={{ marginTop: 14 }}>
            <button className="btn-danger" onClick={handleDelete}>
              Delete hotlist
            </button>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Candidates</h2>
        {hotlist.members.length === 0 ? (
          <div className="empty-state">
            No candidates yet. Add some from the <Link to="/candidates">Candidates</Link> page.
          </div>
        ) : (
          <div className="card-list">
            {hotlist.members.map((m) => (
              <div key={m.id} className="list-card">
                <Link to={`/candidates/${m.candidate.id}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                  <div className="list-card-title">{m.candidate.name}</div>
                  <div className="list-card-meta">
                    {m.candidate.email}
                    {m.candidate.tags.length > 0 ? ' · ' + m.candidate.tags.join(', ') : ''}
                  </div>
                </Link>
                {canManage && (
                  <button className="btn-secondary btn-sm" onClick={() => removeMember(m.candidate.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
