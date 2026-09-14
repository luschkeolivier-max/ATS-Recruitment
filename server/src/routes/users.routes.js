const express = require('express');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// List users, optionally filtered by role. Used to populate interviewer pickers etc.
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
    res.json({ users });
  })
);

module.exports = router;
