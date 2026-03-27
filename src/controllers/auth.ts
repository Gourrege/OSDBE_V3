import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { drivercollections } from '../driverdatabase';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'not_secret_at_all';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const driver = await drivercollections.driver?.findOne({ email, isDeleted: { $ne: true } });

    if (!driver || !driver.hashedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (driver.status === 'suspended') {
      return res.status(403).json({ message: 'User account is suspended' });
    }

    const passwordMatch = await bcrypt.compare(password, driver.hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        driverId: driver._id.toString(), //Changes the MongoDB ObjectId to string
        email: driver.email,
        role: driver.role
      },
      JWT_SECRET,
      { expiresIn: '15m' } // Token valid for 15 minutes, I did because 1hr seemed excessive.
    );

    res.json({
      token,
      user: {
        id: driver._id?.toString(),
        name: driver.name,
        email: driver.email,
        role: driver.role,
        status: driver.status,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
