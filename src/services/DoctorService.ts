import { Doctor } from "../entities/Doctor";
import { DoctorRepository } from "../repositories/DoctorRepository";
import { SpecialtyRepository } from "../repositories/SpecialtyRepository";
import { CreateDoctorDTO, UpdateDoctorDTO } from "../dtos/DoctorDTO";
import { AppError } from "../errors/AppError";

export class DoctorService {
  private doctorRepository: DoctorRepository;
  private specialtyRepository: SpecialtyRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
    this.specialtyRepository = new SpecialtyRepository();
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorRepository.findAll();
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError("Médico não encontrado", 404);
    }

    return doctor;
  }

  async create(data: CreateDoctorDTO): Promise<Doctor> {
    const existingCrm = await this.doctorRepository.findByCrm(data.crm);
    if (existingCrm) {
      throw new AppError("Já existe um médico com este CRM", 409);
    }

    const existingEmail = await this.doctorRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError("Já existe um médico com este email", 409);
    }

    const specialty = await this.specialtyRepository.findById(data.specialtyId);
    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    const doctor = await this.doctorRepository.create({
      name: data.name,
      crm: data.crm,
      email: data.email,
      phone: data.phone,
      specialtyId: data.specialtyId,
    });

    return this.doctorRepository.findById(doctor.id) as Promise<Doctor>;
  }

  async update(id: string, data: UpdateDoctorDTO): Promise<Doctor> {
    const doctor = await this.findById(id);

    if (data.email && data.email !== doctor.email) {
      const existingEmail = await this.doctorRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError("Já existe um médico com este email", 409);
      }
    }

    if (data.specialtyId) {
      const specialty = await this.specialtyRepository.findById(data.specialtyId);
      if (!specialty) {
        throw new AppError("Especialidade não encontrada", 404);
      }
    }

    const updateData: Partial<Doctor> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.specialtyId) updateData.specialtyId = data.specialtyId;

    const updated = await this.doctorRepository.update(id, updateData);

    if (!updated) {
      throw new AppError("Erro ao atualizar médico", 500);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    const deleted = await this.doctorRepository.delete(id);
    if (!deleted) {
      throw new AppError("Erro ao remover médico", 500);
    }
  }
}
