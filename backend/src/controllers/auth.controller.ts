import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

interface Matchmaker {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  assignedClientIds: string[];
}

const MATCHMAKER_PATH = path.resolve(process.cwd(), 'src/data/matchmaker.json');

const readMatchmakers = (): Matchmaker[] =>
  JSON.parse(fs.readFileSync(MATCHMAKER_PATH, 'utf-8')) as Matchmaker[];

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const matchmaker = readMatchmakers().find((entry) => entry.email === email);

  if (!matchmaker) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const isValid = await bcrypt.compare(password, matchmaker.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'JWT secret is not configured' });
    return;
  }

  const token = jwt.sign({ matchmakerId: matchmaker.id }, secret, {
    expiresIn: '8h',
  });

  res.cookie('tdc_matchmaker_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  });

  res.json({
    matchmaker: {
      id: matchmaker.id,
      name: matchmaker.name,
      email: matchmaker.email,
      assignedClientIds: matchmaker.assignedClientIds,
    },
  });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('tdc_matchmaker_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.json({ success: true, message: 'Logged out successfully' });
};
