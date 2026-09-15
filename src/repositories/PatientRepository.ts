import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Patient } from "../entities/Patient";

export class PatientRepository {
  private repository: Repository<Patient>;

  constructor() {
    this.repository = AppDataSource.getRepository(Patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.repository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Patient | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    return this.repository.findOne({ where: { cpf } });
  }

  async create(data: Partial<Patient>): Promise<Patient> {
    const patient = this.repository.create(data);
    return this.repository.save(patient);
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
