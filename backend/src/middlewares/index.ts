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
  next();
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

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
