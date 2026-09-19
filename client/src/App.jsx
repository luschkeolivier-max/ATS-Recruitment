import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplyProfile from './pages/ApplyProfile';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import CandidatesList from './pages/CandidatesList';
import CandidateDetail from './pages/CandidateDetail';
import CandidateShowcase from './pages/CandidateShowcase';
import ApplicationDetail from './pages/ApplicationDetail';
import InterviewRequests from './pages/InterviewRequests';

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/apply" element={<ApplyProfile />} />
          <Route path="/candidates/:candidateId/showcase" element={<CandidateShowcase />} />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidatesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/:candidateId"
            element={
              <ProtectedRoute>
                <CandidateDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:applicationId"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-requests"
            element={
              <ProtectedRoute>
                <InterviewRequests />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
    </div>
  );
}
