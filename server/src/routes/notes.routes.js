const express = require('express');
const { z } = require('zod');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const createSchema = z.object({
  applicationId: z.string().min(1),
  content: z.string().min(1),
});

router.use(authenticate);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

    const note = await prisma.note.create({
      data: { ...parsed.data, authorId: req.user.id },
      include: { author: { select: { id: true, name: true } } },
    });
    res.status(201).json({ note });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) throw new AppError(404, 'Note not found');
    if (note.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'You can only delete your own notes');
    }
    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
