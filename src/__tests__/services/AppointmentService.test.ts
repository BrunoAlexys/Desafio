jest.mock("../../entities/Patient", () => ({ Patient: class Patient {} }));
jest.mock("../../entities/Doctor", () => ({ Doctor: class Doctor {} }));
jest.mock("../../entities/Specialty", () => ({ Specialty: class Specialty {} }));
jest.mock("../../entities/Appointment", () => ({
  Appointment: class Appointment {},
  AppointmentStatus: {
    SCHEDULED: "SCHEDULED",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
  },
}));

jest.mock("../../config/database", () => ({
  AppDataSource: { getRepository: jest.fn() },
}));

jest.mock("../../repositories/AppointmentRepository");
jest.mock("../../repositories/PatientRepository");
jest.mock("../../repositories/DoctorRepository");

import { AppointmentService } from "../../services/AppointmentService";
import { AppointmentRepository } from "../../repositories/AppointmentRepository";
import { PatientRepository } from "../../repositories/PatientRepository";
import { DoctorRepository } from "../../repositories/DoctorRepository";
import { AppError } from "../../errors/AppError";
import { AppointmentStatus } from "../../entities/Appointment";
import { CreateAppointmentDTO } from "../../dtos/AppointmentDTO";

describe("AppointmentService", () => {
  let service: AppointmentService;
  let mockAppointmentRepo: jest.Mocked<AppointmentRepository>;
  let mockPatientRepo: jest.Mocked<PatientRepository>;
  let mockDoctorRepo: jest.Mocked<DoctorRepository>;

  const mockPatient = {
    id: "uuid-patient-1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-0000",
    cpf: "123.456.789-00",
    birthDate: new Date("1990-05-15"),
  };

  const mockDoctor = {
    id: "uuid-doctor-1",
    name: "Dr. Carlos",
    crm: "CRM/SP 123456",
    email: "carlos@clinica.com",
    phone: "(11) 97777-0000",
    specialtyId: "uuid-specialty-1",
  };

  // Data futura para os testes (7 dias à frente)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  futureDate.setHours(14, 0, 0, 0);
  const futureDateISO = futureDate.toISOString();

  const mockAppointment = {
    id: "uuid-appointment-1",
    patient: mockPatient,
    patientId: "uuid-patient-1",
    doctor: mockDoctor,
    doctorId: "uuid-doctor-1",
    dateTime: futureDate,
    status: AppointmentStatus.SCHEDULED,
    notes: "Consulta de rotina",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentService();
    mockAppointmentRepo = (service as any).appointmentRepository as jest.Mocked<AppointmentRepository>;
    mockPatientRepo = (service as any).patientRepository as jest.Mocked<PatientRepository>;
    mockDoctorRepo = (service as any).doctorRepository as jest.Mocked<DoctorRepository>;
  });

  // ─── findAll ──────────────────────────────────────────────
  describe("findAll", () => {
    it("deve retornar lista de agendamentos", async () => {
      mockAppointmentRepo.findAll.mockResolvedValue([mockAppointment as any]);
      const result = await service.findAll();
      expect(result).toEqual([mockAppointment]);
      expect(mockAppointmentRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // ─── findById ─────────────────────────────────────────────
  describe("findById", () => {
    it("deve retornar o agendamento quando encontrado", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      const result = await service.findById("uuid-appointment-1");
      expect(result).toEqual(mockAppointment);
    });

    it("deve lançar AppError 404 quando agendamento não existe", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(null);
      await expect(service.findById("inexistente")).rejects.toMatchObject({
        statusCode: 404,
        message: "Agendamento não encontrado",
      });
    });
  });

  // ─── findByDoctorId ───────────────────────────────────────
  describe("findByDoctorId", () => {
    it("deve retornar agendamentos de um médico", async () => {
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockAppointmentRepo.findByDoctorId.mockResolvedValue([mockAppointment as any]);
      const result = await service.findByDoctorId("uuid-doctor-1");
      expect(result).toEqual([mockAppointment]);
    });

    it("deve lançar AppError 404 quando médico não existe", async () => {
      mockDoctorRepo.findById.mockResolvedValue(null);
      await expect(service.findByDoctorId("inexistente")).rejects.toMatchObject({
        statusCode: 404,
        message: "Médico não encontrado",
      });
    });
  });

  // ─── findByPatientId ──────────────────────────────────────
  describe("findByPatientId", () => {
    it("deve retornar agendamentos de um paciente", async () => {
      mockPatientRepo.findById.mockResolvedValue(mockPatient as any);
      mockAppointmentRepo.findByPatientId.mockResolvedValue([mockAppointment as any]);
      const result = await service.findByPatientId("uuid-patient-1");
      expect(result).toEqual([mockAppointment]);
    });

    it("deve lançar AppError 404 quando paciente não existe", async () => {
      mockPatientRepo.findById.mockResolvedValue(null);
      await expect(service.findByPatientId("inexistente")).rejects.toMatchObject({
        statusCode: 404,
        message: "Paciente não encontrado",
      });
    });
  });

  // ─── create ───────────────────────────────────────────────
  describe("create", () => {
    const createDTO: CreateAppointmentDTO = {
      patientId: "uuid-patient-1",
      doctorId: "uuid-doctor-1",
      dateTime: futureDateISO,
      notes: "Primeira consulta",
    };

    it("deve criar um agendamento com sucesso", async () => {
      mockPatientRepo.findById.mockResolvedValue(mockPatient as any);
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockAppointmentRepo.findConflict.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue(mockAppointment as any);

      const result = await service.create(createDTO);

      expect(result).toEqual(mockAppointment);
      expect(mockPatientRepo.findById).toHaveBeenCalledWith("uuid-patient-1");
      expect(mockDoctorRepo.findById).toHaveBeenCalledWith("uuid-doctor-1");
      expect(mockAppointmentRepo.findConflict).toHaveBeenCalledTimes(1);
      expect(mockAppointmentRepo.create).toHaveBeenCalledTimes(1);
    });

    it("deve lançar AppError 404 quando paciente não existe", async () => {
      mockPatientRepo.findById.mockResolvedValue(null);
      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 404,
        message: "Paciente não encontrado",
      });
      expect(mockAppointmentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 404 quando médico não existe", async () => {
      mockPatientRepo.findById.mockResolvedValue(mockPatient as any);
      mockDoctorRepo.findById.mockResolvedValue(null);
      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 404,
        message: "Médico não encontrado",
      });
      expect(mockAppointmentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 400 quando data é no passado", async () => {
      const pastDTO = { ...createDTO, dateTime: "2020-01-01T10:00:00.000Z" };
      mockPatientRepo.findById.mockResolvedValue(mockPatient as any);
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);

      await expect(service.create(pastDTO)).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível agendar consultas no passado",
      });
      expect(mockAppointmentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando há conflito de horário", async () => {
      mockPatientRepo.findById.mockResolvedValue(mockPatient as any);
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockAppointmentRepo.findConflict.mockResolvedValue(mockAppointment as any);

      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 409,
        message: "O médico já possui uma consulta agendada neste horário",
      });
      expect(mockAppointmentRepo.create).not.toHaveBeenCalled();
    });

    it("deve verificar conflito com janela de 1 hora (±30 min)", async () => {
      mockPatientRepo.findById.mockResolvedValue(mockPatient as any);
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockAppointmentRepo.findConflict.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue(mockAppointment as any);

      await service.create(createDTO);

      const callArgs = mockAppointmentRepo.findConflict.mock.calls[0];
      const startTime = callArgs[1] as Date;
      const endTime = callArgs[2] as Date;
      const diffMs = endTime.getTime() - startTime.getTime();

      expect(diffMs).toBe(60 * 60 * 1000); // 60 min
      expect(callArgs[0]).toBe("uuid-doctor-1");
    });
  });

  // ─── update ───────────────────────────────────────────────
  describe("update", () => {
    it("deve atualizar o agendamento com sucesso", async () => {
      const updatedAppointment = { ...mockAppointment, notes: "Nota atualizada" };
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.update.mockResolvedValue(updatedAppointment as any);

      const result = await service.update("uuid-appointment-1", { notes: "Nota atualizada" });
      expect(result.notes).toBe("Nota atualizada");
    });

    it("deve lançar AppError 400 quando consulta está cancelada", async () => {
      const cancelledAppointment = { ...mockAppointment, status: AppointmentStatus.CANCELLED };
      mockAppointmentRepo.findById.mockResolvedValue(cancelledAppointment as any);
      await expect(
        service.update("uuid-appointment-1", { notes: "Teste" })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível alterar uma consulta cancelada ou concluída",
      });
    });

    it("deve lançar AppError 400 quando consulta está concluída", async () => {
      const completedAppointment = { ...mockAppointment, status: AppointmentStatus.COMPLETED };
      mockAppointmentRepo.findById.mockResolvedValue(completedAppointment as any);
      await expect(
        service.update("uuid-appointment-1", { notes: "Teste" })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível alterar uma consulta cancelada ou concluída",
      });
    });

    it("deve verificar conflito ao alterar data/hora", async () => {
      const newFutureDate = new Date();
      newFutureDate.setDate(newFutureDate.getDate() + 14);

      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.findConflict.mockResolvedValue(null);
      mockAppointmentRepo.update.mockResolvedValue({ ...mockAppointment, dateTime: newFutureDate } as any);

      await service.update("uuid-appointment-1", { dateTime: newFutureDate.toISOString() });
      expect(mockAppointmentRepo.findConflict).toHaveBeenCalledTimes(1);
    });

    it("deve lançar AppError 400 quando nova data é no passado", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      await expect(
        service.update("uuid-appointment-1", { dateTime: "2020-01-01T10:00:00.000Z" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("deve ignorar conflito quando é o mesmo agendamento", async () => {
      const newFutureDate = new Date();
      newFutureDate.setDate(newFutureDate.getDate() + 14);

      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.findConflict.mockResolvedValue(mockAppointment as any); // mesmo ID
      mockAppointmentRepo.update.mockResolvedValue({ ...mockAppointment, dateTime: newFutureDate } as any);

      const result = await service.update("uuid-appointment-1", { dateTime: newFutureDate.toISOString() });
      expect(result).toBeDefined();
      expect(mockAppointmentRepo.update).toHaveBeenCalledTimes(1);
    });

    it("deve lançar AppError 409 quando conflito é com outro agendamento", async () => {
      const newFutureDate = new Date();
      newFutureDate.setDate(newFutureDate.getDate() + 14);

      const outroAppointment = { ...mockAppointment, id: "uuid-outro" };
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.findConflict.mockResolvedValue(outroAppointment as any);

      await expect(
        service.update("uuid-appointment-1", { dateTime: newFutureDate.toISOString() })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("deve lançar AppError 404 quando agendamento não existe", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(null);
      await expect(service.update("inexistente", { notes: "Teste" })).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando update retorna null", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.update.mockResolvedValue(null);
      await expect(service.update("uuid-appointment-1", { notes: "Teste" })).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ─── cancel ───────────────────────────────────────────────
  describe("cancel", () => {
    it("deve cancelar um agendamento com sucesso", async () => {
      const cancelledAppointment = { ...mockAppointment, status: AppointmentStatus.CANCELLED };
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.update.mockResolvedValue(cancelledAppointment as any);

      const result = await service.cancel("uuid-appointment-1");
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(mockAppointmentRepo.update).toHaveBeenCalledWith("uuid-appointment-1", {
        status: AppointmentStatus.CANCELLED,
      });
    });

    it("deve lançar AppError 400 quando consulta já está concluída", async () => {
      const completedAppointment = { ...mockAppointment, status: AppointmentStatus.COMPLETED };
      mockAppointmentRepo.findById.mockResolvedValue(completedAppointment as any);
      await expect(service.cancel("uuid-appointment-1")).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível cancelar uma consulta já concluída",
      });
    });

    it("deve lançar AppError 400 quando consulta já está cancelada", async () => {
      const cancelledAppointment = { ...mockAppointment, status: AppointmentStatus.CANCELLED };
      mockAppointmentRepo.findById.mockResolvedValue(cancelledAppointment as any);
      await expect(service.cancel("uuid-appointment-1")).rejects.toMatchObject({
        statusCode: 400,
        message: "Esta consulta já está cancelada",
      });
    });

    it("deve cancelar consulta com status CONFIRMED", async () => {
      const confirmedAppointment = { ...mockAppointment, status: AppointmentStatus.CONFIRMED };
      const cancelledAppointment = { ...confirmedAppointment, status: AppointmentStatus.CANCELLED };
      mockAppointmentRepo.findById.mockResolvedValue(confirmedAppointment as any);
      mockAppointmentRepo.update.mockResolvedValue(cancelledAppointment as any);

      const result = await service.cancel("uuid-appointment-1");
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it("deve lançar AppError 404 quando agendamento não existe", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(null);
      await expect(service.cancel("inexistente")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando update retorna null", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.update.mockResolvedValue(null);
      await expect(service.cancel("uuid-appointment-1")).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ─── delete ───────────────────────────────────────────────
  describe("delete", () => {
    it("deve deletar o agendamento com sucesso", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.delete.mockResolvedValue(true);
      await expect(service.delete("uuid-appointment-1")).resolves.toBeUndefined();
    });

    it("deve lançar AppError 404 quando agendamento não existe", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(null);
      await expect(service.delete("inexistente")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando delete falha", async () => {
      mockAppointmentRepo.findById.mockResolvedValue(mockAppointment as any);
      mockAppointmentRepo.delete.mockResolvedValue(false);
      await expect(service.delete("uuid-appointment-1")).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
