import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

const JWT_SECRET =
  process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_123456789';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async register(req: any, res: any) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios',
        });
      }

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res
          .status(409)
          .json({ success: false, message: 'Email já cadastrado' });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hash,
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async updateAvatar(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada',
        });
      }

      const cloudinaryUrl = process.env.CLOUDINARY_URL;
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      const isConfigured = cloudinaryUrl || (cloudName && apiKey && apiSecret);

      if (!isConfigured) {
        return res.status(500).json({
          success: false,
          message: 'Serviço de armazenamento não configurado',
        });
      }

      const buffer = req.file.buffer;
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          resource_type: 'image',
          format: 'jpg',
          quality: 'auto',
        },
        async (error, result) => {
          if (error) {
            console.error('Erro ao fazer upload para Cloudinary:', error);
            return res.status(500).json({
              success: false,
              message: 'Erro ao fazer upload da imagem',
            });
          }

          if (!result) {
            return res.status(500).json({
              success: false,
              message: 'Erro ao processar imagem',
            });
          }

          if (user.avatarUrl && user.avatarUrl.includes('cloudinary.com')) {
            try {
              const urlParts = user.avatarUrl.split('/');
              const uploadIndex = urlParts.findIndex(
                (part: string) => part === 'image' || part === 'upload',
              );
              if (uploadIndex !== -1 && urlParts[uploadIndex + 1]) {
                const publicIdWithPath = urlParts
                  .slice(uploadIndex + 2)
                  .join('/')
                  .split('.')[0];
                if (publicIdWithPath) {
                  await cloudinary.uploader.destroy(publicIdWithPath);
                }
              }
            } catch (deleteError) {
              console.error('Erro ao deletar avatar antigo:', deleteError);
            }
          }

          user.avatarUrl = result.secure_url;
          await user.save();

          res.json({
            success: true,
            message: 'Avatar atualizado com sucesso',
            data: {
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
              },
            },
          });
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
