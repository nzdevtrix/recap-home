import express from 'express';

const router = express.Router();

// In-memory store for now
const riders: any[] = [];

router.get('/available', (req, res) => {
  const { regionId } = req.query;
  const available = riders.filter(
    (r: any) => r.isAvailable && (!regionId || r.regionId === regionId)
  );
  res.json(available);
});

router.post('/', (req, res) => {
  const rider = { id: String(riders.length + 1), ...req.body };
  riders.push(rider);
  res.json(rider);
});

export default router;