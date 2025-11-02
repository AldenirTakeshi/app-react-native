import { Request, Response } from 'express';
import { Location } from '../models';

export class LocationController {
  static async list(req: Request, res: Response) {
    try {
      const locations = await Location.find().sort({ name: 1 }).exec();

      res.json({
        success: true,
        data: { locations },
        count: locations.length,
      });
    } catch (error) {
      console.error('Erro ao listar locais:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const location = await Location.findById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Local não encontrado',
        });
      }

      res.json({
        success: true,
        data: { location },
      });
    } catch (error) {
      console.error('Erro ao buscar local:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const {
        name,
        address,
        latitude,
        longitude,
        city,
        state,
        country,
        zipCode,
      } = req.body;

      if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nome, latitude e longitude são obrigatórios',
        });
      }

      const location = await Location.create({
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        city,
        state,
        country,
        zipCode,
      });

      res.status(201).json({
        success: true,
        message: 'Local criado com sucesso',
        data: { location },
      });
    } catch (error: any) {
      console.error('Erro ao criar local:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors)
            .map((e: any) => e.message)
            .join(', '),
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        latitude,
        longitude,
        city,
        state,
        country,
        zipCode,
      } = req.body;

      const location = await Location.findById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Local não encontrado',
        });
      }

      if (name) location.name = name;
      if (address !== undefined) location.address = address;
      if (latitude !== undefined) location.latitude = Number(latitude);
      if (longitude !== undefined) location.longitude = Number(longitude);
      if (city !== undefined) location.city = city;
      if (state !== undefined) location.state = state;
      if (country !== undefined) location.country = country;
      if (zipCode !== undefined) location.zipCode = zipCode;

      await location.save();

      res.json({
        success: true,
        message: 'Local atualizado com sucesso',
        data: { location },
      });
    } catch (error: any) {
      console.error('Erro ao atualizar local:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors)
            .map((e: any) => e.message)
            .join(', '),
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const location = await Location.findById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Local não encontrado',
        });
      }

      await Location.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Local deletado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar local:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
