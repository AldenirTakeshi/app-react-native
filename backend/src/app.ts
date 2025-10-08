import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

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

export default app;
