import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Weather backend is running',
    timestamp: new Date().toISOString()
  });
});

export default router;