import express from 'express';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message, role } = req.body;
  // Will integrate with Mistral API chatbot service
  res.json({ response: `Echo: ${message} (role: ${role})` });
});

export default router;