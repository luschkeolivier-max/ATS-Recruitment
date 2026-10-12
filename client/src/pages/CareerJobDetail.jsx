import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import Brand from '../components/Brand';

export default function CareerJobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/public/jobs/${jobId}`)
      .then((data) => setJob(data.job))
      .catch((err) => setError(err.message));
  }, [jobId]);

  if (error) return <div className="empty-state">{error}</div>;
  if (!job) return <div className="empty-state">Loading...</div>;

  return (
    <div className="showcase-page">
      <div className="showcase-topbar">
        <Brand />
      </div>
      <div className="breadcrumb" style={{ marginBottom: 10 }}>
        <Link to="/careers">&larr; All open roles</Link>
      </div>
      <div className="detail-header">
        <h1>{job.title}</h1>
        <div className="detail-meta">
          {[job.company?.name, job.department, job.location].filter(Boolean).join(' · ') || 'No details'}
        </div>
        {job.description && <p style={{ marginTop: 12, color: '#374151' }}>{job.description}</p>}
        <div style={{ marginTop: 14 }}>
          <Link to={`/apply?jobId=${job.id}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Apply for this role
          </Link>
        </div>
      </div>
    </div>
  );
}
