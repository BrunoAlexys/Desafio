// ─── Mock de TODOS os módulos que causam referência circular ────────────────
// Entities mockadas como simples objetos
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

jest.mock("../../repositories/PatientRepository");

import { PatientService } from "../../services/PatientService";
import { PatientRepository } from "../../repositories/PatientRepository";
import { AppError } from "../../errors/AppError";
import { CreatePatientDTO } from "../../dtos/PatientDTO";

describe("PatientService", () => {
  let service: PatientService;
  let mockRepo: jest.Mocked<PatientRepository>;

  const mockPatient = {
    id: "uuid-patient-1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-0000",
    cpf: "123.456.789-00",
    birthDate: new Date("1990-05-15"),
    appointments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PatientService();
    mockRepo = (service as any).patientRepository as jest.Mocked<PatientRepository>;
  });

  // ─── findAll ──────────────────────────────────────────────
  describe("findAll", () => {
    it("deve retornar uma lista de pacientes", async () => {
      mockRepo.findAll.mockResolvedValue([mockPatient as any]);

      const result = await service.findAll();

      expect(result).toEqual([mockPatient]);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it("deve retornar lista vazia quando não há pacientes", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findById ─────────────────────────────────────────────
  describe("findById", () => {
    it("deve retornar o paciente quando encontrado", async () => {
      mockRepo.findById.mockResolvedValue(mockPatient as any);

      const result = await service.findById("uuid-patient-1");

      expect(result).toEqual(mockPatient);
      expect(mockRepo.findById).toHaveBeenCalledWith("uuid-patient-1");
    });

    it("deve lançar AppError 404 quando paciente não existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById("inexistente")).rejects.toThrow(AppError);
      await expect(service.findById("inexistente")).rejects.toMatchObject({
        statusCode: 404,
        message: "Paciente não encontrado",
      });
    });
  });

  // ─── create ───────────────────────────────────────────────
  describe("create", () => {
    const createDTO: CreatePatientDTO = {
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "(11) 88888-0000",
      cpf: "987.654.321-00",
      birthDate: "1985-03-20",
    };

    it("deve criar um paciente com sucesso", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.findByCpf.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ ...mockPatient, ...createDTO, birthDate: new Date(createDTO.birthDate) } as any);

      const result = await service.create(createDTO);

      expect(result.name).toBe("Maria Santos");
      expect(mockRepo.findByEmail).toHaveBeenCalledWith("maria@email.com");
      expect(mockRepo.findByCpf).toHaveBeenCalledWith("987.654.321-00");
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it("deve lançar AppError 409 quando email já existe", async () => {
      mockRepo.findByEmail.mockResolvedValue(mockPatient as any);

      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 409,
        message: "Já existe um paciente com este email",
      });
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando CPF já existe", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.findByCpf.mockResolvedValue(mockPatient as any);

      await expect(service.create(createDTO)).rejects.toMatchObject({
        statusCode: 409,
        message: "Já existe um paciente com este CPF",
      });
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── update ───────────────────────────────────────────────
  describe("update", () => {
    it("deve atualizar o paciente com sucesso", async () => {
      const updatedPatient = { ...mockPatient, name: "João Atualizado" };
      mockRepo.findById.mockResolvedValue(mockPatient as any);
      mockRepo.update.mockResolvedValue(updatedPatient as any);

      const result = await service.update("uuid-patient-1", { name: "João Atualizado" });

      expect(result.name).toBe("João Atualizado");
    });

    it("deve lançar AppError 409 quando novo email já existe em outro paciente", async () => {
      const outroPatient = { ...mockPatient, id: "uuid-outro", email: "novo@email.com" };
      mockRepo.findById.mockResolvedValue(mockPatient as any);
      mockRepo.findByEmail.mockResolvedValue(outroPatient as any);

      await expect(
        service.update("uuid-patient-1", { email: "novo@email.com" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("deve permitir manter o mesmo email sem erro", async () => {
      mockRepo.findById.mockResolvedValue(mockPatient as any);
      mockRepo.update.mockResolvedValue(mockPatient as any);

      await service.update("uuid-patient-1", { email: "joao@email.com" });

      expect(mockRepo.findByEmail).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 404 quando paciente não existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.update("inexistente", { name: "Teste" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando update retorna null", async () => {
      mockRepo.findById.mockResolvedValue(mockPatient as any);
      mockRepo.update.mockResolvedValue(null);

      await expect(
        service.update("uuid-patient-1", { name: "Teste" })
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ─── delete ───────────────────────────────────────────────
  describe("delete", () => {
    it("deve deletar o paciente com sucesso", async () => {
      mockRepo.findById.mockResolvedValue(mockPatient as any);
      mockRepo.delete.mockResolvedValue(true);

      await expect(service.delete("uuid-patient-1")).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith("uuid-patient-1");
    });

    it("deve lançar AppError 404 quando paciente não existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.delete("inexistente")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar AppError 500 quando delete falha", async () => {
      mockRepo.findById.mockResolvedValue(mockPatient as any);
      mockRepo.delete.mockResolvedValue(false);

      await expect(service.delete("uuid-patient-1")).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
