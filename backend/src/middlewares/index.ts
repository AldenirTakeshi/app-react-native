import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET =
  process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_123456789';

export const exampleMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Middleware example logic
  console.log('Request received:', req.method, req.url);
  next();
};

// Middleware de autenticação JWT
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Buscar o usuário no banco
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Adicionar o usuário ao request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
  }
};
