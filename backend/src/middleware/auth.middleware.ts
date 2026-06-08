import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      matchmakerId?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.tdc_matchmaker_token;

  if (!token || typeof token !== 'string') {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '') as {
      matchmakerId: string;
    };

    req.matchmakerId = decoded.matchmakerId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export {};
