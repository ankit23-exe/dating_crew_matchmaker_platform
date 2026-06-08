import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
	getAllClients,
	getClientById,
	updateClientStage,
	updateClientStatus,
} from '../controllers/clients.controller.js';

const clientsRoutes = Router();

clientsRoutes.use(authMiddleware);
clientsRoutes.get('/', getAllClients);
clientsRoutes.get('/:id', getClientById);
clientsRoutes.patch('/:id/status', updateClientStatus);
clientsRoutes.patch('/:id/stage', updateClientStage);

export default clientsRoutes;
