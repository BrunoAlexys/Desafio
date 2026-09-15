import { Patient } from "../entities/Patient";
import { PatientRepository } from "../repositories/PatientRepository";
import { CreatePatientDTO, UpdatePatientDTO } from "../dtos/PatientDTO";
import { AppError } from "../errors/AppError";

export class PatientService {
  private patientRepository: PatientRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.findAll();
  }

  async findById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    return patient;
  }

  async create(data: CreatePatientDTO): Promise<Patient> {
    const existingEmail = await this.patientRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError("Já existe um paciente com este email", 409);
    }

    const existingCpf = await this.patientRepository.findByCpf(data.cpf);
    if (existingCpf) {
      throw new AppError("Já existe um paciente com este CPF", 409);
    }

    return this.patientRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      birthDate: new Date(data.birthDate),
    });
  }

  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const patient = await this.findById(id);

    if (data.email && data.email !== patient.email) {
      const existingEmail = await this.patientRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError("Já existe um paciente com este email", 409);
      }
    }

    const updateData: Partial<Patient> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.birthDate) updateData.birthDate = new Date(data.birthDate);

    const updated = await this.patientRepository.update(id, updateData);

    if (!updated) {
      throw new AppError("Erro ao atualizar paciente", 500);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    const deleted = await this.patientRepository.delete(id);
    if (!deleted) {
      throw new AppError("Erro ao remover paciente", 500);
    }
  }
}
