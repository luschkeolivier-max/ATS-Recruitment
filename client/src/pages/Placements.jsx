import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const STATUS_CLASS = { PENDING: 'badge-draft', INVOICED: 'badge-draft', PAID: 'badge-open' };

function estimateFee(p) {
  if (p.feeType === 'FLAT') return p.feeAmount || 0;
  if (p.salary && p.feePercentage) return (p.salary * p.feePercentage) / 100;
  return 0;
}

export default function Placements() {
  const [placements, setPlacements] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const data = await api.get(`/placements?${params.toString()}`);
      setPlacements(data.placements);
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

  const totalFees = placements.reduce((sum, p) => sum + estimateFee(p), 0);
  const paidFees = placements.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + estimateFee(p), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Placements</h1>
      </div>

      <div className="toolbar" style={{ gap: 20, alignItems: 'flex-end' }}>
        <div>
          <div className="list-card-meta">Total fees (all statuses)</div>
          <div style={{ fontSize: 22, fontWeight: 700 }} className="mono">
            ${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div className="list-card-meta">Paid</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }} className="mono">
            ${paidFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginLeft: 'auto' }}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="INVOICED">Invoiced</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : placements.length === 0 ? (
        <div className="empty-state">No placements yet.</div>
      ) : (
        <div className="card-list">
          {placements.map((p) => (
            <div key={p.id} className="list-card" style={{ cursor: 'default' }}>
              <div>
                <div className="list-card-title">
                  <Link to={`/applications/${p.application.id}`}>{p.application.candidate.name}</Link> —{' '}
                  {p.application.job.title}
                </div>
                <div className="list-card-meta">
                  {p.company?.name || 'No company on file'} · Starts {new Date(p.startDate).toLocaleDateString()} ·
                  Fee: ${estimateFee(p).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[p.status]}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
