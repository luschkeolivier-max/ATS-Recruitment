const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const router = express.Router();

const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Your name is required').max(200),
  companyName: z.string().trim().min(1, 'Company name is required').max(200),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  rolesNeeded: z.string().trim().min(1, 'Tell us which roles you need').max(500),
  headcount: z.string().trim().max(50).optional().or(z.literal('')),
  message: z.string().trim().max(3000).optional().or(z.literal('')),
});

// Public hiring inquiry from the marketing site — no auth, create-only.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const { phone, headcount, message, ...rest } = parsed.data;
    await prisma.inquiry.create({
      data: { ...rest, phone: phone || null, headcount: headcount || null, message: message || null },
    });

    res.status(201).json({ ok: true });
  })
);

module.exports = router;
