const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const candidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  whatsapp: z.string().optional(),
  resumeUrl: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, tag } = req.query;
    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        tag ? { tags: { has: tag } } : {},
      ],
    };
    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });
    res.json({ candidates });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: {
        applications: {
          include: { job: { select: { id: true, title: true, status: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!candidate) throw new AppError(404, 'Candidate not found');
    res.json({ candidate });
  })
);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = candidateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const candidate = await prisma.candidate.create({ data: parsed.data });
    res.status(201).json({ candidate });
  })
);

router.patch(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = candidateSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ candidate });
  })
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.candidate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
