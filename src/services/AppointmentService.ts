import { Appointment, AppointmentStatus } from "../entities/Appointment";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { PatientRepository } from "../repositories/PatientRepository";
import { DoctorRepository } from "../repositories/DoctorRepository";
import { CreateAppointmentDTO, UpdateAppointmentDTO } from "../dtos/AppointmentDTO";
import { AppError } from "../errors/AppError";

export class AppointmentService {
  private appointmentRepository: AppointmentRepository;
  private patientRepository: PatientRepository;
  private doctorRepository: DoctorRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.patientRepository = new PatientRepository();
    this.doctorRepository = new DoctorRepository();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.findAll();
  }

  async findById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    return appointment;
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError("Médico não encontrado", 404);
    }

    return this.appointmentRepository.findByDoctorId(doctorId);
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    return this.appointmentRepository.findByPatientId(patientId);
  }

  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    // Validar que o paciente existe
    const patient = await this.patientRepository.findById(data.patientId);
    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    // Validar que o médico existe
    const doctor = await this.doctorRepository.findById(data.doctorId);
    if (!doctor) {
      throw new AppError("Médico não encontrado", 404);
    }

    const dateTime = new Date(data.dateTime);

    // Validar que a data é no futuro
    if (dateTime <= new Date()) {
      throw new AppError("Não é possível agendar consultas no passado", 400);
    }

    // Validar conflito de horário (janela de 1 hora)
    const startTime = new Date(dateTime.getTime() - 30 * 60 * 1000); // 30 min antes
    const endTime = new Date(dateTime.getTime() + 30 * 60 * 1000);   // 30 min depois

    const conflict = await this.appointmentRepository.findConflict(
      data.doctorId,
      startTime,
      endTime
    );

    if (conflict) {
      throw new AppError(
        "O médico já possui uma consulta agendada neste horário",
        409
      );
    }

    return this.appointmentRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      dateTime,
      notes: data.notes || null,
      status: AppointmentStatus.SCHEDULED,
    } as Partial<Appointment>);
  }

  async update(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    const appointment = await this.findById(id);

    // Não permite alterar consultas canceladas ou concluídas
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new AppError(
        "Não é possível alterar uma consulta cancelada ou concluída",
        400
      );
    }

    if (data.dateTime) {
      const newDateTime = new Date(data.dateTime);

      if (newDateTime <= new Date()) {
        throw new AppError("Não é possível agendar consultas no passado", 400);
      }

      // Verificar conflito no novo horário
      const startTime = new Date(newDateTime.getTime() - 30 * 60 * 1000);
      const endTime = new Date(newDateTime.getTime() + 30 * 60 * 1000);

      const conflict = await this.appointmentRepository.findConflict(
        appointment.doctorId,
        startTime,
        endTime
      );

      if (conflict && conflict.id !== id) {
        throw new AppError(
          "O médico já possui uma consulta agendada neste horário",
          409
        );
      }
    }

    const updateData: Partial<Appointment> = {};
    if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes as any;

    const updated = await this.appointmentRepository.update(id, updateData);

    if (!updated) {
      throw new AppError("Erro ao atualizar agendamento", 500);
    }

    return updated;
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findById(id);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new AppError("Não é possível cancelar uma consulta já concluída", 400);
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError("Esta consulta já está cancelada", 400);
    }

    const updated = await this.appointmentRepository.update(id, {
      status: AppointmentStatus.CANCELLED,
    });

    if (!updated) {
      throw new AppError("Erro ao cancelar agendamento", 500);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    const deleted = await this.appointmentRepository.delete(id);
    if (!deleted) {
      throw new AppError("Erro ao remover agendamento", 500);
    }
  }
}
