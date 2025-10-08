import { Request, Response } from 'express';

class BaseController {
    getAll(req: Request, res: Response) {
        // Implementar lógica para obter todos os registros
    }

    getById(req: Request, res: Response) {
        // Implementar lógica para obter um registro pelo ID
    }

    create(req: Request, res: Response) {
        // Implementar lógica para criar um novo registro
    }

    update(req: Request, res: Response) {
        // Implementar lógica para atualizar um registro existente
    }

    delete(req: Request, res: Response) {
        // Implementar lógica para deletar um registro
    }
}

export default BaseController;