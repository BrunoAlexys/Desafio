import { Specialty } from "../entities/Specialty";
import { SpecialtyRepository } from "../repositories/SpecialtyRepository";
import { CreateSpecialtyDTO, UpdateSpecialtyDTO } from "../dtos/SpecialtyDTO";
import { AppError } from "../errors/AppError";

export class SpecialtyService {
  private specialtyRepository: SpecialtyRepository;

  constructor() {
    this.specialtyRepository = new SpecialtyRepository();
  }

  async findAll(): Promise<Specialty[]> {
    return this.specialtyRepository.findAll();
  }

  async findById(id: string): Promise<Specialty> {
    const specialty = await this.specialtyRepository.findById(id);

    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    return specialty;
  }

  async create(data: CreateSpecialtyDTO): Promise<Specialty> {
    const existing = await this.specialtyRepository.findByName(data.name);
    if (existing) {
      throw new AppError("Já existe uma especialidade com este nome", 409);
    }

    return this.specialtyRepository.create({
      name: data.name,
      description: data.description || null,
    } as Partial<Specialty>);
  }

  async update(id: string, data: UpdateSpecialtyDTO): Promise<Specialty> {
    const specialty = await this.findById(id);

    if (data.name && data.name !== specialty.name) {
      const existing = await this.specialtyRepository.findByName(data.name);
      if (existing) {
        throw new AppError("Já existe uma especialidade com este nome", 409);
      }
    }

    const updateData: Partial<Specialty> = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description as any;

    const updated = await this.specialtyRepository.update(id, updateData);

    if (!updated) {
      throw new AppError("Erro ao atualizar especialidade", 500);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    const deleted = await this.specialtyRepository.delete(id);
    if (!deleted) {
      throw new AppError("Erro ao remover especialidade", 500);
    }
  }
}
