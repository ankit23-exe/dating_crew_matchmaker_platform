import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import type { Client, JourneyStage } from '../types/client.types.js';

interface MatchmakerRecord {
  id: string;
  assignedClientIds: string[];
}

interface ClientNoteBody {
  text?: string;
}

interface StatusBody {
  status?: Client['status'];
}

interface StageBody {
  journeyStage?: JourneyStage;
}

const CLIENTS_PATH = path.resolve(process.cwd(), 'src/data/clients.json');
const MATCHMAKER_PATH = path.resolve(process.cwd(), 'src/data/matchmaker.json');

const readClients = (): Client[] =>
  JSON.parse(fs.readFileSync(CLIENTS_PATH, 'utf-8')) as Client[];

const writeClients = (clients: Client[]): void => {
  fs.writeFileSync(CLIENTS_PATH, JSON.stringify(clients, null, 2));
};

const readMatchmakers = (): MatchmakerRecord[] =>
  JSON.parse(fs.readFileSync(MATCHMAKER_PATH, 'utf-8')) as MatchmakerRecord[];

const getAssignedIds = (matchmakerId: string): string[] => {
  const matchmaker = readMatchmakers().find((entry) => entry.id === matchmakerId);
  return matchmaker?.assignedClientIds ?? [];
};

const computeAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const withAge = (client: Client) => ({
  ...client,
  age: computeAge(client.dateOfBirth),
});

const isAssignedClient = (matchmakerId: string, clientId: string): boolean =>
  getAssignedIds(matchmakerId).includes(clientId);

export const getAllClients = (req: Request, res: Response): void => {
  const matchmakerId = req.matchmakerId;

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const assignedIds = new Set(getAssignedIds(matchmakerId));
  const clients = readClients().filter((client) => assignedIds.has(client.id));

  res.json(clients.map(withAge));
};

export const getClientById = (req: Request, res: Response): void => {
  const matchmakerId = req.matchmakerId;

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const clients = readClients();
  const client = clients.find(
    (entry) => entry.id === req.params.id && isAssignedClient(matchmakerId, entry.id),
  );

  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  res.json(withAge(client));
};

export const updateClientStatus = (req: Request, res: Response): void => {
  const matchmakerId = req.matchmakerId;
  const { status } = req.body as StatusBody;
  const allowedStatuses: Client['status'][] = ['New', 'Active', 'Match Sent', 'Matched', 'Paused'];

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!status || !allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  const clients = readClients();
  const index = clients.findIndex(
    (entry) => entry.id === req.params.id && isAssignedClient(matchmakerId, entry.id),
  );

  if (index === -1) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  clients[index].status = status;
  writeClients(clients);

  res.json({ success: true, updated: withAge(clients[index]) });
};

export const updateClientStage = (req: Request, res: Response): void => {
  const matchmakerId = req.matchmakerId;
  const { journeyStage } = req.body as StageBody;
  const allowedStages: JourneyStage[] = [
    'onboarding',
    'profiling',
    'active_search',
    'intro_sent',
    'date_scheduled',
    'post_date',
    'committed',
    'paused',
  ];

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!journeyStage || !allowedStages.includes(journeyStage)) {
    res.status(400).json({ error: 'Invalid journeyStage value' });
    return;
  }

  const clients = readClients();
  const index = clients.findIndex(
    (entry) => entry.id === req.params.id && isAssignedClient(matchmakerId, entry.id),
  );

  if (index === -1) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  clients[index].journeyStage = journeyStage;
  writeClients(clients);

  res.json({ success: true, updated: withAge(clients[index]) });
};

export const addNote = (req: Request, res: Response): void => {
  const matchmakerId = req.matchmakerId;
  const { text } = req.body as ClientNoteBody;

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'Note text is required' });
    return;
  }

  const clients = readClients();
  const index = clients.findIndex(
    (entry) => entry.id === req.params.clientId && isAssignedClient(matchmakerId, entry.id),
  );

  if (index === -1) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  const note = {
    text: text.trim(),
    timestamp: new Date().toISOString(),
  };

  clients[index].notes.push(note);
  writeClients(clients);

  res.status(201).json({ success: true, note });
};
