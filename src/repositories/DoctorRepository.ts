import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Doctor } from "../entities/Doctor";

export class DoctorRepository {
  private repository: Repository<Doctor>;

  constructor() {
    this.repository = AppDataSource.getRepository(Doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.repository.find({
      relations: { specialty: true },
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Doctor | null> {
    return this.repository.findOne({
      where: { id },
      relations: { specialty: true },
    });
  }

  async findByCrm(crm: string): Promise<Doctor | null> {
    return this.repository.findOne({ where: { crm } });
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findBySpecialtyId(specialtyId: string): Promise<Doctor[]> {
    return this.repository.find({
      where: { specialtyId },
      relations: { specialty: true },
    });
  }

  async create(data: Partial<Doctor>): Promise<Doctor> {
    const doctor = this.repository.create(data);
    return this.repository.save(doctor);
  }

  async update(id: string, data: Partial<Doctor>): Promise<Doctor | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
