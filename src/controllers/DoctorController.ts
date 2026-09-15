import { Request, Response, NextFunction } from "express";
import { DoctorService } from "../services/DoctorService";

export class DoctorController {
  private doctorService: DoctorService;

  constructor() {
    this.doctorService = new DoctorService();
  }

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctors = await this.doctorService.findAll();
      res.status(200).json({
        status: "success",
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const doctor = await this.doctorService.findById(id as string);
      res.status(200).json({
        status: "success",
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctor = await this.doctorService.create(req.body);
      res.status(201).json({
        status: "success",
        message: "Médico criado com sucesso",
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const doctor = await this.doctorService.update(id as string, req.body);
      res.status(200).json({
        status: "success",
        message: "Médico atualizado com sucesso",
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.doctorService.delete(id as string);
      res.status(200).json({
        status: "success",
        message: "Médico removido com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
