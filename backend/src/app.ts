import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import categoryRoutes from './routes/categories';
import locationRoutes from './routes/locations';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando!',
    version: '1.0.0',
  });
});

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rotas de eventos
app.use('/events', eventRoutes);

// Rotas de categorias
app.use('/categories', categoryRoutes);

// Rotas de locais
app.use('/locations', locationRoutes);

export default app;
