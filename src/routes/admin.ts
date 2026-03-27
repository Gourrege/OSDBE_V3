import express, { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role_auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminDashboardStats,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUserRole,
  updateAdminUserStatus
} from '../controllers/admin';
import { adminCreateUserSchema, resetPasswordSchema, updateRoleSchema, updateStatusSchema } from '../models/drivers';

const router: Router = express.Router();

router.get('/admin/dashboard/stats', authMiddleware, requireAdmin, getAdminDashboardStats);
router.get('/admin/users', authMiddleware, requireAdmin, getAdminUsers);
router.post('/admin/users', authMiddleware, requireAdmin, validate(adminCreateUserSchema), createAdminUser);
router.patch('/admin/users/:id/role', authMiddleware, requireAdmin, validate(updateRoleSchema), updateAdminUserRole);
router.patch('/admin/users/:id/status', authMiddleware, requireAdmin, validate(updateStatusSchema), updateAdminUserStatus);
router.patch('/admin/users/:id/reset-password', authMiddleware, requireAdmin, validate(resetPasswordSchema), resetAdminUserPassword);
router.delete('/admin/users/:id', authMiddleware, requireAdmin, deleteAdminUser);

export default router;
