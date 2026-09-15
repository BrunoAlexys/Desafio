import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Specialty } from "../entities/Specialty";

export class SpecialtyRepository {
  private repository: Repository<Specialty>;

  constructor() {
    this.repository = AppDataSource.getRepository(Specialty);
  }

  async findAll(): Promise<Specialty[]> {
    return this.repository.find({
      order: { name: "ASC" },
    });
  }

  async findById(id: string): Promise<Specialty | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Specialty | null> {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: Partial<Specialty>): Promise<Specialty> {
    const specialty = this.repository.create(data);
    return this.repository.save(specialty);
  }

  async update(id: string, data: Partial<Specialty>): Promise<Specialty | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
