import express, {Router} from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role_auth.middleware';
import {
  getDrivers,
  getDriversById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/drivers';
import { validate } from '../middleware/validate.middleware';
import { createDriverSchema } from '../models/drivers';

const router: Router = express.Router();

router.get('/driver', authMiddleware, getDrivers);
router.get('/driver/:id', authMiddleware, getDriversById);
router.post('/driver', authMiddleware, requireRole(['creator', 'admin']), validate(createDriverSchema), createDriver);
router.put('/driver/:id', authMiddleware, requireRole(['creator', 'admin']), updateDriver);
router.delete('/driver/:id', authMiddleware, requireRole(['creator', 'admin']), deleteDriver);
export default router;
