const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const placementSchema = z.object({
  applicationId: z.string().min(1),
  companyId: z.string().optional(),
  startDate: z.coerce.date(),
  salary: z.coerce.number().optional(),
  currency: z.string().optional(),
  feeType: z.enum(['PERCENTAGE', 'FLAT']).optional(),
  feePercentage: z.coerce.number().optional(),
  feeAmount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'INVOICED', 'PAID']).optional(),
  startDate: z.coerce.date().optional(),
  salary: z.coerce.number().optional(),
  currency: z.string().optional(),
  feeType: z.enum(['PERCENTAGE', 'FLAT']).optional(),
  feePercentage: z.coerce.number().optional(),
  feeAmount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const placementInclude = {
  application: {
    include: {
      candidate: { select: { id: true, name: true } },
      job: { select: { id: true, title: true } },
    },
  },
  company: { select: { id: true, name: true } },
};

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const placements = await prisma.placement.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: placementInclude,
    });
    res.json({ placements });
  })
);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = placementSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const application = await prisma.application.findUnique({ where: { id: parsed.data.applicationId } });
    if (!application) throw new AppError(404, 'Application not found');

    const placement = await prisma.$transaction(async (tx) => {
      const created = await tx.placement.create({
        data: { ...parsed.data, createdById: req.user.id },
        include: placementInclude,
      });
      if (application.stage !== 'HIRED') {
        await tx.application.update({ where: { id: application.id }, data: { stage: 'HIRED' } });
        await tx.stageHistory.create({
          data: {
            applicationId: application.id,
            fromStage: application.stage,
            toStage: 'HIRED',
            changedById: req.user.id,
          },
        });
      }
      return created;
    });

    res.status(201).json({ placement });
  })
);

router.patch(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const placement = await prisma.placement.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: placementInclude,
    });
    res.json({ placement });
  })
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.placement.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
