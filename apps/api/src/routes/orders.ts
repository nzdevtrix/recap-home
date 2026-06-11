import express from 'express';

const router = express.Router();

// In-memory store for now (will use Prisma after db setup)
const orders: any[] = [];

router.post('/', (req, res) => {
  const { userId, items, total, pickupAddress, deliveryAddress } = req.body;
  const order = {
    id: String(orders.length + 1),
    userId,
    items,
    total,
    pickupAddress,
    deliveryAddress,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  orders.push(order);
  res.json(order);
});

router.get('/', (req, res) => {
  res.json(orders);
});

router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/:id/assign-rider', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { riderId } = req.body;
  order.riderId = riderId;
  order.status = 'ASSIGNED';
  order.updatedAt = new Date();
  res.json(order);
});

export default router;