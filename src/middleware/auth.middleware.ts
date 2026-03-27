// import { Request, Response, NextFunction } from 'express';

// export const authenticateKey = async (req : Request, res : Response, next : NextFunction) => {
//     const apiKey = req.headers['x-api-key'];

//     if (!apiKey) {
//         return res.status(401).json({'message' : 'Unauthorized: API key is missing'});
//     }
//     next();
// };

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthDriver } from '../models/authdriver';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'not_secret_at_all';
 
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthDriver;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
