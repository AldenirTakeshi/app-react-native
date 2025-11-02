import { Request, Response } from 'express';

const getFullUrl = (req: Request, path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const protocol = req.protocol;
  const host = req.get('host');

  const baseUrl = process.env.API_BASE_URL || `${protocol}://${host}`;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

export class UploadController {
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada',
        });
      }

      const relativePath = `/uploads/${req.file.filename}`;
      const fullUrl = getFullUrl(req, relativePath);

      res.json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          url: relativePath,
          fullUrl: fullUrl,
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
