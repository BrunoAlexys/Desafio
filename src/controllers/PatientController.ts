import { Request, Response, NextFunction } from "express";
import { PatientService } from "../services/PatientService";

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patients = await this.patientService.findAll();
      res.status(200).json({
        status: "success",
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const patient = await this.patientService.findById(id as string);
      res.status(200).json({
        status: "success",
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await this.patientService.create(req.body);
      res.status(201).json({
        status: "success",
        message: "Paciente criado com sucesso",
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const patient = await this.patientService.update(id as string, req.body);
      res.status(200).json({
        status: "success",
        message: "Paciente atualizado com sucesso",
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.patientService.delete(id as string);
      res.status(200).json({
        status: "success",
        message: "Paciente removido com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
