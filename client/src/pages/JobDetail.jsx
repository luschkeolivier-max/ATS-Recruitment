import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
const statusClass = { OPEN: 'badge-open', CLOSED: 'badge-closed', DRAFT: 'badge-draft' };

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(null);

  const load = async () => {
    try {
      const [jobData, appsData] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications?jobId=${jobId}`),
      ]);
      setJob(jobData.job);
      setApplications(appsData.applications);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    await api.del(`/jobs/${jobId}`);
    navigate('/jobs');
  };

  const moveStage = async (applicationId, stage) => {
    const prev = applications;
    setApplications((apps) => apps.map((a) => (a.id === applicationId ? { ...a, stage } : a)));
    try {
      await api.patch(`/applications/${applicationId}/stage`, { stage });
    } catch (err) {
      setApplications(prev);
      setError(err.message);
    }
  };

  const handleDrop = (e, stage) => {
    const applicationId = e.dataTransfer.getData('text/plain');
    setDragOverStage(null);
    if (applicationId) moveStage(applicationId, stage);
  };

  if (error) return <div className="alert-error">{error}</div>;
  if (!job) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="detail-header">
        <h1>{job.title}</h1>
        <div className="detail-meta">
          {job.department && <span>{job.department}</span>}
          {job.location && <span>{job.location}</span>}
          <span className={`badge ${statusClass[job.status] || ''}`}>{job.status}</span>
          <span>Posted by {job.createdBy?.name}</span>
        </div>
        {job.description && <p style={{ marginTop: 12, color: '#374151' }}>{job.description}</p>}
        {canManage && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={() => setShowAddCandidate(true)}>
              + Add candidate
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              Delete job
            </button>
          </div>
        )}
      </div>

      <div className="board">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.stage === stage);
          return (
            <div
              key={stage}
              className={`board-column ${dragOverStage === stage ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="board-column-header">
                <span>{stage}</span>
                <span>{stageApps.length}</span>
              </div>
              {stageApps.map((app) => (
                <div
                  key={app.id}
                  className="board-card"
                  draggable={canManage}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', app.id)}
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <div className="board-card-name">{app.candidate.name}</div>
                  <div className="board-card-meta">
                    {app._count.notes} note{app._count.notes === 1 ? '' : 's'} ·{' '}
                    {app._count.interviews} interview{app._count.interviews === 1 ? '' : 's'}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {showAddCandidate && (
        <AddCandidateModal
          jobId={jobId}
          existingCandidateIds={applications.map((a) => a.candidateId)}
          onClose={() => setShowAddCandidate(false)}
          onAdded={() => {
            setShowAddCandidate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddCandidateModal({ jobId, existingCandidateIds, onClose, onAdded }) {
  const [candidates, setCandidates] = useState([]);
  const [candidateId, setCandidateId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/candidates')
      .then((data) => {
        const available = data.candidates.filter((c) => !existingCandidateIds.includes(c.id));
        setCandidates(available);
        if (available.length > 0) setCandidateId(available[0].id);
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidateId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/applications', { candidateId, jobId });
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add candidate to job" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div className="alert-error">{error}</div>}
        {candidates.length === 0 ? (
          <div className="empty-state">
            No candidates available. <Link to="/candidates">Create one first.</Link>
          </div>
        ) : (
          <label>
            Candidate
            <select value={candidateId} onChange={(e) => setCandidateId(e.target.value)}>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || candidates.length === 0}>
            {submitting ? 'Adding...' : 'Add to pipeline'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
