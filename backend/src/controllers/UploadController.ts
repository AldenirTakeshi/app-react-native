import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export class UploadController {
  static async uploadImage(req: Request, res: Response) {
    try {
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
        const missing = [];
        if (!cloudinaryUrl && !cloudName) missing.push('CLOUDINARY_URL ou CLOUDINARY_CLOUD_NAME');
        if (!cloudinaryUrl && !apiKey) missing.push('CLOUDINARY_API_KEY');
        if (!cloudinaryUrl && !apiSecret) missing.push('CLOUDINARY_API_SECRET');
        
        console.error('Cloudinary não configurado. Variáveis faltando:', missing.join(', '));
        return res.status(500).json({
          success: false,
          message: `Serviço de armazenamento não configurado. Variáveis faltando: ${missing.join(', ')}`,
        });
      }

      const buffer = req.file.buffer;
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'eventos',
          resource_type: 'image',
          format: 'jpg',
          quality: 'auto',
        },
        (error, result) => {
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

          res.json({
            success: true,
            message: 'Imagem enviada com sucesso',
            data: {
              url: result.secure_url,
              fullUrl: result.secure_url,
              publicId: result.public_id,
              filename: result.original_filename || 'image',
            },
          });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
