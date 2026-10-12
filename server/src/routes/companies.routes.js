const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const companySchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PROSPECT', 'ACTIVE', 'INACTIVE']).optional(),
});

const contactSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    const where = {
      AND: [
        status ? { status } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };
    const companies = await prisma.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { jobs: true, contacts: true, placements: true } } },
    });
    res.json({ companies });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        jobs: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { applications: true } } } },
        placements: {
          orderBy: { createdAt: 'desc' },
          include: {
            application: {
              include: {
                candidate: { select: { id: true, name: true } },
                job: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });
    if (!company) throw new AppError(404, 'Company not found');
    res.json({ company });
  })
);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = companySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const company = await prisma.company.create({
      data: { ...parsed.data, createdById: req.user.id },
    });
    res.status(201).json({ company });
  })
);

router.patch(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = companySchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ company });
  })
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

router.post(
  '/:id/contacts',
  authorize('ADMIN', 'RECRUITER'),
  asyncHandler(async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const contact = await prisma.contact.create({
      data: { ...parsed.data, companyId: req.params.id },
    });
    res.status(201).json({ contact });
  })
);

module.exports = router;
