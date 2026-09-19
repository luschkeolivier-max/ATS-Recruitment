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
    const { status } = req.query;
    const requests = await prisma.interviewRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { candidate: { select: { id: true, name: true, email: true } } },
    });
    res.json({ interviewRequests: requests });
  })
);

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']),
});

router.patch(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const request = await prisma.interviewRequest.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json({ interviewRequest: request });
  })
);

module.exports = router;
