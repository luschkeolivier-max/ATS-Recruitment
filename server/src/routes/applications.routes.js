const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

const createSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().min(1),
  stage: z.enum(STAGES).optional(),
});

const stageSchema = z.object({
  stage: z.enum(STAGES),
});

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { jobId, candidateId, stage } = req.query;
    const where = {
      AND: [jobId ? { jobId } : {}, candidateId ? { candidateId } : {}, stage ? { stage } : {}],
    };
    const applications = await prisma.application.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        candidate: { select: { id: true, name: true, email: true, tags: true } },
        job: { select: { id: true, title: true } },
        _count: { select: { notes: true, interviews: true } },
      },
    });
    res.json({ applications });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        candidate: true,
        job: true,
        notes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
        interviews: {
          include: { interviewer: { select: { id: true, name: true } } },
          orderBy: { scheduledAt: 'asc' },
        },
        stageHistory: {
          include: { changedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!application) throw new AppError(404, 'Application not found');
    res.json({ application });
  })
);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);
    const { candidateId, jobId, stage } = parsed.data;

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: { candidateId, jobId, stage: stage || 'APPLIED' },
      });
      await tx.stageHistory.create({
        data: {
          applicationId: created.id,
          fromStage: null,
          toStage: created.stage,
          changedById: req.user.id,
        },
      });
      return created;
    });

    res.status(201).json({ application });
  })
);

router.patch(
  '/:id/stage',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = stageSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Application not found');

    const application = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: req.params.id },
        data: { stage: parsed.data.stage },
      });
      await tx.stageHistory.create({
        data: {
          applicationId: updated.id,
          fromStage: existing.stage,
          toStage: updated.stage,
          changedById: req.user.id,
        },
      });
      return updated;
    });

    res.json({ application });
  })
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.application.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
