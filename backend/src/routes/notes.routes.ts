import { Router } from 'express';
import { addNote } from '../controllers/clients.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const notesRoutes = Router();

notesRoutes.use(authMiddleware);
notesRoutes.post('/:clientId', addNote);

export default notesRoutes;
