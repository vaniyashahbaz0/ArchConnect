import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/uploads/projects', express.static(path.join(currentDir, 'uploads', 'projects')));

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/consultations', consultationRoutes);

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState];

  res.status(state === 'connected' ? 200 : 503).json({
    status: state === 'connected' ? 'ok' : 'error',
    database: state,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : err.message,
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer();
