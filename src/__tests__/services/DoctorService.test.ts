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

jest.mock("../../repositories/DoctorRepository");
jest.mock("../../repositories/SpecialtyRepository");

import { DoctorService } from "../../services/DoctorService";
import { DoctorRepository } from "../../repositories/DoctorRepository";
import { SpecialtyRepository } from "../../repositories/SpecialtyRepository";
import { AppError } from "../../errors/AppError";
import { CreateDoctorDTO } from "../../dtos/DoctorDTO";

describe("DoctorService", () => {
  let service: DoctorService;
  let mockDoctorRepo: jest.Mocked<DoctorRepository>;
  let mockSpecialtyRepo: jest.Mocked<SpecialtyRepository>;

  const mockSpecialty = {
    id: "uuid-specialty-1",
    name: "Cardiologia",
    description: "Especialidade do coração",
    doctors: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDoctor = {
    id: "uuid-doctor-1",
    name: "Dr. Carlos",
    crm: "CRM/SP 123456",
    email: "carlos@clinica.com",
    phone: "(11) 97777-0000",
    specialty: mockSpecialty,
    specialtyId: "uuid-specialty-1",
    appointments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DoctorService();
    mockDoctorRepo = (service as any).doctorRepository as jest.Mocked<DoctorRepository>;
    mockSpecialtyRepo = (service as any).specialtyRepository as jest.Mocked<SpecialtyRepository>;
  });

  // ─── findAll ──────────────────────────────────────────────
  describe("findAll", () => {
    it("deve retornar lista de médicos", async () => {
      mockDoctorRepo.findAll.mockResolvedValue([mockDoctor as any]);
      const result = await service.findAll();
      expect(result).toEqual([mockDoctor]);
      expect(mockDoctorRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it("deve retornar lista vazia", async () => {
      mockDoctorRepo.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ─── findById ─────────────────────────────────────────────
  describe("findById", () => {
    it("deve retornar o médico quando encontrado", async () => {
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      const result = await service.findById("uuid-doctor-1");
      expect(result).toEqual(mockDoctor);
    });

    it("deve lançar AppError 404 quando médico não existe", async () => {
      mockDoctorRepo.findById.mockResolvedValue(null);
      await expect(service.findById("inexistente")).rejects.toMatchObject({
        statusCode: 404,
        message: "Médico não encontrado",
      });
    });
  });

  // ─── create ───────────────────────────────────────────────
  describe("create", () => {
    const createDTO: CreateDoctorDTO = {
      name: "Dr. Ana",
      crm: "CRM/SP 654321",
      email: "ana@clinica.com",
      phone: "(11) 96666-0000",
      specialtyId: "uuid-specialty-1",
    };

    it("deve criar um médico com sucesso", async () => {
      mockDoctorRepo.findByCrm.mockResolvedValue(null);
      mockDoctorRepo.findByEmail.mockResolvedValue(null);
      mockSpecialtyRepo.findById.mockResolvedValue(mockSpecialty as any);
      const createdDoctor = { ...mockDoctor, ...createDTO };
      mockDoctorRepo.create.mockResolvedValue(createdDoctor as any);
      mockDoctorRepo.findById.mockResolvedValue(createdDoctor as any);

      const result = await service.create(createDTO);

      expect(result.name).toBe("Dr. Ana");
      expect(mockDoctorRepo.findByCrm).toHaveBeenCalledWith("CRM/SP 654321");
      expect(mockDoctorRepo.findByEmail).toHaveBeenCalledWith("ana@clinica.com");
      expect(mockSpecialtyRepo.findById).toHaveBeenCalledWith("uuid-specialty-1");
    });

    it("deve lançar AppError 409 quando CRM já existe", async () => {
      mockDoctorRepo.findByCrm.mockResolvedValue(mockDoctor as any);
      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 409,
        message: "Já existe um médico com este CRM",
      });
      expect(mockDoctorRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando email já existe", async () => {
      mockDoctorRepo.findByCrm.mockResolvedValue(null);
      mockDoctorRepo.findByEmail.mockResolvedValue(mockDoctor as any);
      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 409,
        message: "Já existe um médico com este email",
      });
      expect(mockDoctorRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 404 quando especialidade não existe", async () => {
      mockDoctorRepo.findByCrm.mockResolvedValue(null);
      mockDoctorRepo.findByEmail.mockResolvedValue(null);
      mockSpecialtyRepo.findById.mockResolvedValue(null);
      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 404,
        message: "Especialidade não encontrada",
      });
      expect(mockDoctorRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── update ───────────────────────────────────────────────
  describe("update", () => {
    it("deve atualizar o médico com sucesso", async () => {
      const updatedDoctor = { ...mockDoctor, name: "Dr. Carlos Atualizado" };
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockDoctorRepo.update.mockResolvedValue(updatedDoctor as any);
      const result = await service.update("uuid-doctor-1", { name: "Dr. Carlos Atualizado" });
      expect(result.name).toBe("Dr. Carlos Atualizado");
    });

    it("deve lançar AppError 409 quando novo email já pertence a outro médico", async () => {
      const outroDoctor = { ...mockDoctor, id: "uuid-outro", email: "outro@clinica.com" };
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockDoctorRepo.findByEmail.mockResolvedValue(outroDoctor as any);
      await expect(
        service.update("uuid-doctor-1", { email: "outro@clinica.com" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("deve validar que nova especialidade existe ao atualizar", async () => {
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockSpecialtyRepo.findById.mockResolvedValue(null);
      await expect(
        service.update("uuid-doctor-1", { specialtyId: "uuid-inexistente" })
      ).rejects.toMatchObject({ statusCode: 404, message: "Especialidade não encontrada" });
    });

    it("deve lançar AppError 404 quando médico não existe", async () => {
      mockDoctorRepo.findById.mockResolvedValue(null);
      await expect(service.update("inexistente", { name: "Teste" })).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando update retorna null", async () => {
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockDoctorRepo.update.mockResolvedValue(null);
      await expect(service.update("uuid-doctor-1", { name: "Teste" })).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ─── delete ───────────────────────────────────────────────
  describe("delete", () => {
    it("deve deletar o médico com sucesso", async () => {
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockDoctorRepo.delete.mockResolvedValue(true);
      await expect(service.delete("uuid-doctor-1")).resolves.toBeUndefined();
    });

    it("deve lançar AppError 404 quando médico não existe", async () => {
      mockDoctorRepo.findById.mockResolvedValue(null);
      await expect(service.delete("inexistente")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando delete falha", async () => {
      mockDoctorRepo.findById.mockResolvedValue(mockDoctor as any);
      mockDoctorRepo.delete.mockResolvedValue(false);
      await expect(service.delete("uuid-doctor-1")).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
