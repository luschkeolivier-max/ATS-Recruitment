const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const RESUME_DIR = path.join(UPLOAD_ROOT, 'resumes');
const VIDEO_DIR = path.join(UPLOAD_ROOT, 'videos');

for (const dir of [RESUME_DIR, VIDEO_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const RESUME_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_BYTES = 250 * 1024 * 1024; // 250MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'video' ? VIDEO_DIR : RESUME_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === 'resume' && file.mimetype !== 'application/pdf') {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume must be a PDF file'));
  }
  if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'video must be a video file'));
  }
  cb(null, true);
}

const uploadCandidateProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: VIDEO_MAX_BYTES },
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// multer's per-field limits aren't configurable via `.fields()`, so re-check
// the resume's actual size after upload.
function enforceResumeSizeLimit(req, res, next) {
  const resumeFile = req.files?.resume?.[0];
  if (resumeFile && resumeFile.size > RESUME_MAX_BYTES) {
    fs.unlink(resumeFile.path, () => {});
    return res.status(400).json({ error: 'Resume PDF must be under 10MB.' });
  }
  next();
}

module.exports = {
  uploadCandidateProfile,
  enforceResumeSizeLimit,
  UPLOAD_ROOT,
  RESUME_MAX_BYTES,
  VIDEO_MAX_BYTES,
};
