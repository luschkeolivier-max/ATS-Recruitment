import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const canManage = user && ['ADMIN', 'RECRUITER'].includes(user.role);

  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = async () => {
    try {
      const data = await api.get(`/applications/${applicationId}`);
      setApplication(data.application);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleStageChange = async (stage) => {
    const prev = application.stage;
    setApplication((a) => ({ ...a, stage }));
    try {
      await api.patch(`/applications/${applicationId}/stage`, { stage });
      load();
    } catch (err) {
      setApplication((a) => ({ ...a, stage: prev }));
      setError(err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSavingNote(true);
    try {
      await api.post('/notes', { applicationId, content: noteContent.trim() });
      setNoteContent('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    await api.del(`/notes/${noteId}`);
    load();
  };

  if (error) return <div className="alert-error">{error}</div>;
  if (!application) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="detail-header">
        <h1>
          <Link to={`/candidates/${application.candidate.id}`}>{application.candidate.name}</Link>
          {' → '}
          <Link to={`/jobs/${application.job.id}`}>{application.job.title}</Link>
        </h1>
        <div className="detail-meta">
          <span>{application.candidate.email}</span>
          <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Stage
            <select
              value={application.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={!canManage}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <h2>Notes</h2>
          <form className="inline-form" onSubmit={handleAddNote} style={{ marginBottom: 14 }}>
            <input
              placeholder="Add a note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={savingNote}>
              Add
            </button>
          </form>
          {application.notes.length === 0 ? (
            <div className="empty-state">No notes yet.</div>
          ) : (
            application.notes.map((note) => (
              <div key={note.id} className="note-item">
                <div>{note.content}</div>
                <div className="note-meta">
                  {note.author.name} · {new Date(note.createdAt).toLocaleString()}
                  {(note.authorId === user.id || user.role === 'ADMIN') && (
                    <>
                      {' · '}
                      <button className="btn-link" onClick={() => handleDeleteNote(note.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <InterviewsSection application={application} canManage={canManage} onChanged={load} />
      </div>

      <div className="section">
        <h2>Stage history</h2>
        {application.stageHistory.length === 0 ? (
          <div className="empty-state">No history yet.</div>
        ) : (
          application.stageHistory.map((h) => (
            <div key={h.id} className="note-item">
              <div>
                {h.fromStage ? `${h.fromStage} → ${h.toStage}` : `Created as ${h.toStage}`}
              </div>
              <div className="note-meta">
                {h.changedBy.name} · {new Date(h.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InterviewsSection({ application, canManage, onChanged }) {
  const { user } = useAuth();
  const [interviewers, setInterviewers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [interviewerId, setInterviewerId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMins, setDurationMins] = useState(30);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/users?role=INTERVIEWER')
      .then((data) => {
        setInterviewers(data.users);
        if (data.users.length > 0) setInterviewerId(data.users[0].id);
      })
      .catch(() => {});
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/interviews', {
        applicationId: application.id,
        interviewerId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMins: Number(durationMins),
        location,
      });
      setShowForm(false);
      setLocation('');
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateInterview = async (id, patch) => {
    await api.patch(`/interviews/${id}`, patch);
    onChanged();
  };

  return (
    <div className="section">
      <h2>Interviews</h2>
      {canManage && (
        <button className="btn-secondary" onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 14 }}>
          {showForm ? 'Cancel' : '+ Schedule interview'}
        </button>
      )}
      {showForm && (
        <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {error && <div className="alert-error">{error}</div>}
          <label>
            Interviewer
            <select value={interviewerId} onChange={(e) => setInterviewerId(e.target.value)} required>
              {interviewers.length === 0 && <option value="">No interviewers registered</option>}
              {interviewers.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date &amp; time
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </label>
          <label>
            Duration (minutes)
            <input
              type="number"
              min={15}
              step={15}
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
            />
          </label>
          <label>
            Location / link
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary" disabled={submitting || !interviewerId}>
            {submitting ? 'Scheduling...' : 'Schedule'}
          </button>
        </form>
      )}

      {application.interviews.length === 0 ? (
        <div className="empty-state">No interviews scheduled.</div>
      ) : (
        application.interviews.map((iv) => (
          <InterviewRow
            key={iv.id}
            interview={iv}
            canEdit={canManage || iv.interviewerId === user.id}
            onUpdate={(patch) => updateInterview(iv.id, patch)}
          />
        ))
      )}
    </div>
  );
}

function InterviewRow({ interview, canEdit, onUpdate }) {
  const [feedback, setFeedback] = useState(interview.feedback || '');
  const [rating, setRating] = useState(interview.rating || '');

  return (
    <div className="note-item">
      <div>
        <strong>{new Date(interview.scheduledAt).toLocaleString()}</strong> ({interview.durationMins} min)
        {interview.location ? ` · ${interview.location}` : ''}
      </div>
      <div className="note-meta">
        With {interview.interviewer.name} ·{' '}
        <select
          value={interview.status}
          disabled={!canEdit}
          onChange={(e) => onUpdate({ status: e.target.value })}
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>
      {canEdit && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <input
            placeholder="Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={{ flex: 1 }}
          />
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Rating</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            className="btn-secondary"
            onClick={() => onUpdate({ feedback, rating: rating ? Number(rating) : undefined })}
          >
            Save
          </button>
        </div>
      )}
      {!canEdit && interview.feedback && (
        <div style={{ marginTop: 6 }}>
          Feedback: {interview.feedback} {interview.rating ? `(${interview.rating}/5)` : ''}
        </div>
      )}
    </div>
  );
}
