import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/clients.routes.js';
import matchRoutes from './routes/match.routes.js';
import notesRoutes from './routes/notes.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

// const allowedOrigins = [
//   process.env.FRONTEND_URL ?? 'http://localhost:3000',
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
// ];

// const corsOptions = {
//   origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//       return;
//     }

//     callback(new Error(`CORS blocked for origin: ${origin}`));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

app.use(cors({
  origin: true,
  credentials: true,
})
);
//console.log(allowedOrigins)
//app.options(/.*/, cors(corsOptions));
app.use(cookieParser());
app.use(express.json());


app.use((req, _res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notes', notesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TDC Matchmaker API' });
});

app.use(errorMiddleware);

export default app;
