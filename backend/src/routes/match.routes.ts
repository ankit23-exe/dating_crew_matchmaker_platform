import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getMatches, sendMatch } from '../controllers/match.controller.js';

const matchRoutes = Router();

matchRoutes.use(authMiddleware);
matchRoutes.get('/:clientId', getMatches);
matchRoutes.post('/send', sendMatch);

export default matchRoutes;
