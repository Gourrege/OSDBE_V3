import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { drivercollections } from '../driverdatabase';
import {
  adminCreateUserSchema,
  adminUserQuerySchema,
  Drivers,
  resetPasswordSchema,
  updateRoleSchema,
  updateStatusSchema
} from '../models/drivers';

const sanitizeDriver = (driver: Drivers & { _id?: ObjectId }) => {
  const { hashedPassword, ...safeDriver } = driver;
  return {
    ...safeDriver,
    id: driver._id?.toString(),
  };
};

export const getAdminDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, activeUsers, suspendedUsers, viewers, creators, admins] = await Promise.all([
      drivercollections.driver?.countDocuments({ isDeleted: { $ne: true } }) || 0,
      drivercollections.driver?.countDocuments({ isDeleted: { $ne: true }, status: 'active' }) || 0,
      drivercollections.driver?.countDocuments({ isDeleted: { $ne: true }, status: 'suspended' }) || 0,
      drivercollections.driver?.countDocuments({ isDeleted: { $ne: true }, role: 'viewer' }) || 0,
      drivercollections.driver?.countDocuments({ isDeleted: { $ne: true }, role: 'creator' }) || 0,
      drivercollections.driver?.countDocuments({ isDeleted: { $ne: true }, role: 'admin' }) || 0,
    ]);

    res.status(200).json({
      totalUsers,
      countsByRole: {
        viewer: viewers,
        creator: creators,
        admin: admins,
      },
      activeUsers,
      suspendedUsers,
    });
  } catch (error) {
    console.error('Error loading admin dashboard stats:', error);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const queryValidation = adminUserQuerySchema.safeParse(req.query);

    if (!queryValidation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: queryValidation.error.issues,
      });
    }

    const { page, limit, role, status, search, includeDeleted } = queryValidation.data;
    const filter: Record<string, unknown> = {};

    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      drivercollections.driver?.find(filter).skip(skip).limit(limit).sort({ lastUpdate: -1 }).toArray(),
      drivercollections.driver?.countDocuments(filter),
    ]);

    res.status(200).json({
      page,
      limit,
      total: total || 0,
      users: (users || []).map((user) => sanitizeDriver(user as Drivers & { _id?: ObjectId })),
    });
  } catch (error) {
    console.error('Error loading admin users:', error);
    res.status(500).json({ message: 'Failed to load users' });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const validation = adminCreateUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const existingUser = await drivercollections.driver?.findOne({
      email: validation.data.email,
      isDeleted: { $ne: true },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    const newUser: Drivers = {
      name: validation.data.name,
      email: validation.data.email,
      hashedPassword,
      role: validation.data.role,
      status: validation.data.status || 'active',
      racingNumber: validation.data.racingNumber,
      nationality: validation.data.nationality,
      driverImage: validation.data.driverImage,
      driverTeam: validation.data.driverTeam,
      driverDES: validation.data.driverDES,
      wins: validation.data.wins,
      podiums: validation.data.podiums,
      driverWC: validation.data.driverWC,
      dob: validation.data.dob,
      dateJoined: new Date(),
      lastUpdate: new Date(),
      isDeleted: false,
      updatedBy: (req as any).user?.driverId,
    };

    const result = await drivercollections.driver?.insertOne(newUser);

    console.log(`Admin ${(req as any).user?.driverId} created user ${validation.data.email}`);

    return res.status(201).json({
      message: `Created a new user with id ${result?.insertedId}`,
      user: sanitizeDriver({
        ...newUser,
        _id: result?.insertedId,
      }),
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

export const updateAdminUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const validation = updateRoleSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const result = await drivercollections.driver?.updateOne(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      {
        $set: {
          role: validation.data.role,
          lastUpdate: new Date(),
          updatedBy: (req as any).user?.driverId,
        },
      }
    );

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Admin ${(req as any).user?.driverId} changed role for user ${id} to ${validation.data.role}`);

    return res.status(200).json({ message: `User role updated to ${validation.data.role}` });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const updateAdminUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const result = await drivercollections.driver?.updateOne(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      {
        $set: {
          status: validation.data.status,
          lastUpdate: new Date(),
          updatedBy: (req as any).user?.driverId,
        },
      }
    );

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Admin ${(req as any).user?.driverId} changed status for user ${id} to ${validation.data.status}`);

    return res.status(200).json({ message: `User status updated to ${validation.data.status}` });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

export const resetAdminUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    const result = await drivercollections.driver?.updateOne(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      {
        $set: {
          hashedPassword,
          lastUpdate: new Date(),
          updatedBy: (req as any).user?.driverId,
        },
      }
    );

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Admin ${(req as any).user?.driverId} reset password for user ${id}`);

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const result = await drivercollections.driver?.updateOne(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          lastUpdate: new Date(),
          updatedBy: (req as any).user?.driverId,
        },
      }
    );

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Admin ${(req as any).user?.driverId} deleted user ${id}`);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
