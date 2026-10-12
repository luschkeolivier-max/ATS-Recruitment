const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const hotlists = await prisma.hotlist.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } }, _count: { select: { members: true } } },
    });
    res.json({ hotlists });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const hotlist = await prisma.hotlist.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        members: {
          orderBy: { addedAt: 'desc' },
          include: { candidate: true },
        },
      },
    });
    if (!hotlist) throw new AppError(404, 'Hotlist not found');
    res.json({ hotlist });
  })
);

const hotlistSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = hotlistSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const hotlist = await prisma.hotlist.create({
      data: { ...parsed.data, createdById: req.user.id },
    });
    res.status(201).json({ hotlist });
  })
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.hotlist.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

const memberSchema = z.object({ candidateId: z.string().min(1) });

router.post(
  '/:id/members',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const member = await prisma.hotlistMember.create({
      data: { hotlistId: req.params.id, candidateId: parsed.data.candidateId },
    });
    res.status(201).json({ member });
  })
);

router.delete(
  '/:id/members/:candidateId',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.hotlistMember.delete({
      where: { hotlistId_candidateId: { hotlistId: req.params.id, candidateId: req.params.candidateId } },
    });
    res.status(204).send();
  })
);

module.exports = router;
