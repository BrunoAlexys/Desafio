import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Appointment } from "../entities/Appointment";

export class AppointmentRepository {
  private repository: Repository<Appointment>;

  constructor() {
    this.repository = AppDataSource.getRepository(Appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.repository.find({
      relations: { patient: true, doctor: { specialty: true } },
      order: { dateTime: "ASC" },
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.repository.findOne({
      where: { id },
      relations: { patient: true, doctor: { specialty: true } },
    });
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    return this.repository.find({
      where: { doctorId },
      relations: { patient: true, doctor: { specialty: true } },
      order: { dateTime: "ASC" },
    });
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return this.repository.find({
      where: { patientId },
      relations: { patient: true, doctor: { specialty: true } },
      order: { dateTime: "ASC" },
    });
  }

  async findConflict(doctorId: string, startTime: Date, endTime: Date): Promise<Appointment | null> {
    return this.repository
      .createQueryBuilder("appointment")
      .where("appointment.doctor_id = :doctorId", { doctorId })
      .andWhere("appointment.date_time BETWEEN :startTime AND :endTime", {
        startTime,
        endTime,
      })
      .andWhere("appointment.status NOT IN (:...excludedStatuses)", {
        excludedStatuses: ["CANCELLED"],
      })
      .getOne();
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.repository.create(data);
    const saved = await this.repository.save(appointment);
    return this.findById(saved.id) as Promise<Appointment>;
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
