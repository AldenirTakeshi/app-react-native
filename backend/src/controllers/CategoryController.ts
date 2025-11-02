import { Request, Response } from 'express';
import { Category } from '../models';

export class CategoryController {
  // Listar todas as categorias
  static async list(req: Request, res: Response) {
    try {
      const categories = await Category.find().sort({ name: 1 }).exec();

      res.json({
        success: true,
        data: { categories },
        count: categories.length,
      });
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Buscar categoria por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada',
        });
      }

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Criar nova categoria
  static async create(req: Request, res: Response) {
    try {
      const { name, description, color, icon } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Nome da categoria é obrigatório',
        });
      }

      const category = await Category.create({
        name,
        description,
        color: color || '#007AFF',
        icon: icon || 'calendar',
      });

      res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: { category },
      });
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Categoria com este nome já existe',
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map((e: any) => e.message).join(', '),
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Atualizar categoria
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, color, icon } = req.body;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada',
        });
      }

      // Atualizar campos
      if (name) category.name = name;
      if (description !== undefined) category.description = description;
      if (color) category.color = color;
      if (icon) category.icon = icon;

      await category.save();

      res.json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: { category },
      });
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Categoria com este nome já existe',
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map((e: any) => e.message).join(', '),
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Deletar categoria
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada',
        });
      }

      await Category.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Categoria deletada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}

