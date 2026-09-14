const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const createSchema = z.object({
  applicationId: z.string().min(1),
  interviewerId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  durationMins: z.number().int().positive().optional(),
  location: z.string().optional(),
});

const updateSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  durationMins: z.number().int().positive().optional(),
  location: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELED']).optional(),
  feedback: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { applicationId, interviewerId } = req.query;
    const where = {
      AND: [applicationId ? { applicationId } : {}, interviewerId ? { interviewerId } : {}],
    };
    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        interviewer: { select: { id: true, name: true } },
        application: {
          select: {
            id: true,
            candidate: { select: { id: true, name: true } },
            job: { select: { id: true, title: true } },
          },
        },
      },
    });
    res.json({ interviews });
  })
);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const interview = await prisma.interview.create({ data: parsed.data });
    res.status(201).json({ interview });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const interview = await prisma.interview.findUnique({ where: { id: req.params.id } });
    if (!interview) throw new AppError(404, 'Interview not found');

    const isOwnerInterviewer = interview.interviewerId === req.user.id;
    const isPrivileged = ['ADMIN', 'RECRUITER'].includes(req.user.role);
    if (!isOwnerInterviewer && !isPrivileged) {
      throw new AppError(403, 'You can only update your own interviews');
    }

    const updated = await prisma.interview.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ interview: updated });
  })
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.interview.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
