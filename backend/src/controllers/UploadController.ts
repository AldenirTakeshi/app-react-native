import { Request, Response } from 'express';

export class UploadController {
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada',
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          url: fileUrl,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}

