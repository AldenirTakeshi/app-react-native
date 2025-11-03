import { Request, Response } from 'express';
import { Event, Category, Location } from '../models';

export class EventController {
  static async list(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        location,
        minPrice,
        maxPrice,
        startDate,
        endDate,
      } = req.query;
      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search as string, $options: 'i' } },
          { description: { $regex: search as string, $options: 'i' } },
        ];
      }

      if (category) {
        query.category = category;
      }

      if (location) {
        query.location = location;
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
          query.price.$gte = Number(minPrice);
        }
        if (maxPrice) {
          query.price.$lte = Number(maxPrice);
        }
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      const events = await Event.find(query)
        .populate('category', 'name color icon')
        .populate('location', 'name latitude longitude address')
        .populate('createdBy', 'name email')
        .sort({ date: 1 })
        .exec();

      res.json({
        success: true,
        data: { events },
        count: events.length,
      });
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const event = await Event.findById(id)
        .populate('category', 'name color icon description')
        .populate(
          'location',
          'name latitude longitude address city state country',
        )
        .populate('createdBy', 'name email')
        .exec();

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado',
        });
      }

      res.json({
        success: true,
        data: { event },
      });
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const {
        name,
        description,
        date,
        time,
        price,
        category,
        location,
        imageUrl,
      } = req.body;

      if (
        !name ||
        !description ||
        !date ||
        !time ||
        !price ||
        !category ||
        !location
      ) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos obrigatórios devem ser preenchidos',
        });
      }

      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada',
        });
      }

      const locationExists = await Location.findById(location);
      if (!locationExists) {
        return res.status(404).json({
          success: false,
          message: 'Local não encontrado',
        });
      }

      const event = await Event.create({
        name,
        description,
        date: new Date(date),
        time,
        price: Number(price),
        category,
        location,
        imageUrl: imageUrl || null,
        createdBy: user._id,
      });

      const eventPopulated = await Event.findById(event._id)
        .populate('category', 'name color icon')
        .populate('location', 'name latitude longitude address')
        .populate('createdBy', 'name email')
        .exec();

      res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        data: { event: eventPopulated },
      });
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
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
      const user = (req as any).user;
      const {
        name,
        description,
        date,
        time,
        price,
        category,
        location,
        imageUrl,
      } = req.body;

      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado',
        });
      }

      if (event.createdBy.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para editar este evento',
        });
      }

      if (name) event.name = name;
      if (description) event.description = description;
      if (date) event.date = new Date(date);
      if (time) event.time = time;
      if (price !== undefined) event.price = Number(price);
      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message: 'Categoria não encontrada',
          });
        }
        event.category = category;
      }
      if (location) {
        const locationExists = await Location.findById(location);
        if (!locationExists) {
          return res.status(404).json({
            success: false,
            message: 'Local não encontrado',
          });
        }
        event.location = location;
      }
      if (imageUrl !== undefined) event.imageUrl = imageUrl;

      await event.save();

      const eventPopulated = await Event.findById(event._id)
        .populate('category', 'name color icon')
        .populate('location', 'name latitude longitude address')
        .populate('createdBy', 'name email')
        .exec();

      res.json({
        success: true,
        message: 'Evento atualizado com sucesso',
        data: { event: eventPopulated },
      });
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
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
      const user = (req as any).user;

      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado',
        });
      }

      if (event.createdBy.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para deletar este evento',
        });
      }

      await Event.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Evento deletado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
