const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const jobRoutes = require('./routes/jobs.routes');
const candidateRoutes = require('./routes/candidates.routes');
const publicCandidateRoutes = require('./routes/publicCandidates.routes');
const publicJobRoutes = require('./routes/publicJobs.routes');
const applicationRoutes = require('./routes/applications.routes');
const interviewRoutes = require('./routes/interviews.routes');
const interviewRequestRoutes = require('./routes/interviewRequests.routes');
const noteRoutes = require('./routes/notes.routes');
const companyRoutes = require('./routes/companies.routes');
const contactRoutes = require('./routes/contacts.routes');
const placementRoutes = require('./routes/placements.routes');
const hotlistRoutes = require('./routes/hotlists.routes');
const errorHandler = require('./middleware/errorHandler');
const { UPLOAD_ROOT } = require('./middleware/upload');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_ROOT));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/public/candidates', publicCandidateRoutes);
app.use('/api/public/jobs', publicJobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/interview-requests', interviewRequestRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/hotlists', hotlistRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;
