import express from 'express';

const router = express.Router();

router.get('/me', (req, res) => {
  res.json({ message: 'Auth endpoint (implement NextAuth.js later)' });
});

export default router;