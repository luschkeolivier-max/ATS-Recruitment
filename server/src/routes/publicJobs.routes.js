const express = require('express');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const router = express.Router();

// The public career page — only open requisitions, and only the fields a
// candidate browsing jobs should see.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const jobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        description: true,
        createdAt: true,
        company: { select: { name: true } },
      },
    });
    res.json({ jobs });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        description: true,
        status: true,
        createdAt: true,
        company: { select: { name: true } },
      },
    });
    if (!job || job.status !== 'OPEN') throw new AppError(404, 'Job not found');
    res.json({ job });
  })
);

module.exports = router;
