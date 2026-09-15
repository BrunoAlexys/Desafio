import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/AppointmentService";

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await this.appointmentService.findAll();
      res.status(200).json({
        status: "success",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.findById(id as string);
      res.status(200).json({
        status: "success",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  findByDoctorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { doctorId } = req.params;
      const appointments = await this.appointmentService.findByDoctorId(doctorId as string);
      res.status(200).json({
        status: "success",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

  findByPatientId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId } = req.params;
      const appointments = await this.appointmentService.findByPatientId(patientId as string);
      res.status(200).json({
        status: "success",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointment = await this.appointmentService.create(req.body);
      res.status(201).json({
        status: "success",
        message: "Consulta agendada com sucesso",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.update(id as string, req.body);
      res.status(200).json({
        status: "success",
        message: "Agendamento atualizado com sucesso",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.cancel(id as string);
      res.status(200).json({
        status: "success",
        message: "Consulta cancelada com sucesso",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.appointmentService.delete(id as string);
      res.status(200).json({
        status: "success",
        message: "Agendamento removido com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
