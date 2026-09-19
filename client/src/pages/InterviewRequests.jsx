import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_CLASS = {
  PENDING: 'badge-draft',
  CONFIRMED: 'badge-open',
  DECLINED: 'badge-closed',
};

export default function InterviewRequests() {
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const data = await api.get(`/interview-requests?${params.toString()}`);
      setRequests(data.interviewRequests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/interview-requests/${id}`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Interview Requests</h1>
          <div className="list-card-meta">Requests from hiring managers via a candidate's showcase link.</div>
        </div>
      </div>

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="DECLINED">Declined</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">No interview requests yet.</div>
      ) : (
        <div className="card-list">
          {requests.map((r) => (
            <div key={r.id} className="list-card" style={{ cursor: 'default' }}>
              <div>
                <div className="list-card-title">
                  <Link to={`/candidates/${r.candidate.id}`}>{r.candidate.name}</Link> — {r.roleTitle}
                </div>
                <div className="list-card-meta">
                  Requested by {r.requesterName} ({r.requesterEmail}) at {r.companyName}
                </div>
                <div className="list-card-meta">
                  Proposed for {new Date(r.scheduledAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
                {canManage && r.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-secondary btn-sm" onClick={() => updateStatus(r.id, 'CONFIRMED')}>
                      Confirm
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => updateStatus(r.id, 'DECLINED')}>
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
