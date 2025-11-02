import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import categoryRoutes from './routes/categories';
import locationRoutes from './routes/locations';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando!',
    version: '1.0.0',
  });
});

app.use('/auth', authRoutes);

app.use('/events', eventRoutes);

app.use('/categories', categoryRoutes);

app.use('/locations', locationRoutes);

app.use('/upload', uploadRoutes);

export default app;
