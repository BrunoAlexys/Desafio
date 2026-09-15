import { Request, Response, NextFunction } from "express";
import { SpecialtyService } from "../services/SpecialtyService";

export class SpecialtyController {
  private specialtyService: SpecialtyService;

  constructor() {
    this.specialtyService = new SpecialtyService();
  }

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialties = await this.specialtyService.findAll();
      res.status(200).json({
        status: "success",
        data: specialties,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const specialty = await this.specialtyService.findById(id as string);
      res.status(200).json({
        status: "success",
        data: specialty,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialty = await this.specialtyService.create(req.body);
      res.status(201).json({
        status: "success",
        message: "Especialidade criada com sucesso",
        data: specialty,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const specialty = await this.specialtyService.update(id as string, req.body);
      res.status(200).json({
        status: "success",
        message: "Especialidade atualizada com sucesso",
        data: specialty,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.specialtyService.delete(id as string);
      res.status(200).json({
        status: "success",
        message: "Especialidade removida com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
