import { Request, Response } from 'express';

class BaseController {
  static getAll(req: Request, res: Response) {
    res.json({ message: 'Get all - implementar lógica' });
  }

  static getById(req: Request, res: Response) {
    res.json({ message: 'Get by ID - implementar lógica' });
  }

  static create(req: Request, res: Response) {
    res.json({ message: 'Create - implementar lógica' });
  }

  static update(req: Request, res: Response) {
    res.json({ message: 'Update - implementar lógica' });
  }

  static delete(req: Request, res: Response) {
    res.json({ message: 'Delete - implementar lógica' });
  }
}

export { BaseController as YourController };
export default BaseController;
