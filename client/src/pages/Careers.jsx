import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Brand from '../components/Brand';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/public/jobs')
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="showcase-page">
      <div className="showcase-topbar">
        <Brand />
      </div>
      <div className="page-header">
        <div>
          <h1>Open roles</h1>
          <div className="list-card-meta">{jobs.length} open requisition{jobs.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {jobs.length === 0 ? (
        <div className="empty-state">No open roles right now — check back soon.</div>
      ) : (
        <div className="card-list">
          {jobs.map((j) => (
            <Link key={j.id} to={`/careers/${j.id}`} className="list-card">
              <div>
                <div className="list-card-title">{j.title}</div>
                <div className="list-card-meta">
                  {[j.company?.name, j.department, j.location].filter(Boolean).join(' · ') || 'No details'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
