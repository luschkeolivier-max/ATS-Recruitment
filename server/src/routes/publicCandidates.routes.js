const express = require('express');
const fs = require('fs');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { uploadCandidateProfile, enforceResumeSizeLimit } = require('../middleware/upload');
const { parseResumePdf } = require('../services/resumeParser');

const router = express.Router();

const profileSchema = z.object({
  name: z.string().min(1, 'Name and surname is required'),
  email: z.string().email(),
  phone: z.string().min(1, 'Contact number is required'),
  linkedinUrl: z.string().url('Enter a valid LinkedIn URL'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
});

// Public candidate self-service profile creation — no auth. A candidate
// fills this in themselves, so it only ever creates (never updates) a
// Candidate record, and only accepts the fields a candidate should provide.
router.post(
  '/',
  uploadCandidateProfile,
  enforceResumeSizeLimit,
  asyncHandler(async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const resumeFile = req.files?.resume?.[0];
    const videoFile = req.files?.video?.[0];
    if (!resumeFile) throw new AppError(400, 'An updated resume (PDF) is required');
    if (!videoFile) throw new AppError(400, 'A video introduction is required');

    const existing = await prisma.candidate.findUnique({ where: { email: parsed.data.email } });
    if (existing) throw new AppError(409, 'A profile with this email already exists');

    const candidate = await prisma.candidate.create({
      data: {
        ...parsed.data,
        source: 'Candidate self-signup',
        resumeUrl: `/uploads/resumes/${resumeFile.filename}`,
        videoIntroUrl: `/uploads/videos/${videoFile.filename}`,
      },
    });

    // Best-effort: parsing failures never block profile creation.
    const extracted = await parseResumePdf(fs.readFileSync(resumeFile.path));
    let finalCandidate = candidate;
    if (extracted) {
      finalCandidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          resumeSummary: extracted.summary,
          resumeSkills: extracted.skills,
          resumeAchievements: extracted.achievements,
          redactedResumeText: extracted.redactedResumeText,
          resumeParsedAt: new Date().toISOString(),
        },
      });
    }

    res.status(201).json({
      candidate: { id: finalCandidate.id, name: finalCandidate.name, email: finalCandidate.email },
    });
  })
);

// Public, redacted candidate showcase — the link a recruiter shares with a
// hiring manager for a specific candidate. Deliberately omits anything that
// would let a client contact the candidate directly or learn their surname.
router.get(
  '/:id/showcase',
  asyncHandler(async (req, res) => {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.id } });
    if (!candidate) throw new AppError(404, 'Candidate not found');

    res.json({
      candidate: {
        id: candidate.id,
        firstName: candidate.name.trim().split(/\s+/)[0],
        videoIntroUrl: candidate.videoIntroUrl,
        summary: candidate.resumeSummary,
        skills: candidate.resumeSkills,
        achievements: candidate.resumeAchievements,
        redactedResumeText: candidate.redactedResumeText,
      },
    });
  })
);

const MIN_NOTICE_HOURS = 24;

const interviewRequestSchema = z.object({
  requesterName: z.string().min(1, 'Name and surname is required'),
  companyName: z.string().min(1, 'Company name is required'),
  requesterEmail: z.string().email(),
  roleTitle: z.string().min(1, 'Position / role is required'),
  scheduledAt: z.coerce.date(),
});

// A hiring manager requesting an interview from the showcase page above.
router.post(
  '/:id/interview-requests',
  asyncHandler(async (req, res) => {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.id } });
    if (!candidate) throw new AppError(404, 'Candidate not found');

    const parsed = interviewRequestSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const minAllowed = new Date(Date.now() + MIN_NOTICE_HOURS * 60 * 60 * 1000);
    if (parsed.data.scheduledAt < minAllowed) {
      throw new AppError(400, `Interviews require at least ${MIN_NOTICE_HOURS} hours' notice`);
    }

    const request = await prisma.interviewRequest.create({
      data: { ...parsed.data, candidateId: candidate.id },
    });

    res.status(201).json({ interviewRequest: { id: request.id } });
  })
);

module.exports = router;
