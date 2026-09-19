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
          resumeParsedAt: new Date().toISOString(),
        },
      });
    }

    res.status(201).json({
      candidate: { id: finalCandidate.id, name: finalCandidate.name, email: finalCandidate.email },
    });
  })
);

module.exports = router;
