import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEnum } from "class-validator";
import { AppointmentStatus } from "../entities/Appointment";

export class CreateAppointmentDTO {
  @IsUUID("4", { message: "ID do paciente inválido" })
  @IsNotEmpty({ message: "O paciente é obrigatório" })
  patientId: string;

  @IsUUID("4", { message: "ID do médico inválido" })
  @IsNotEmpty({ message: "O médico é obrigatório" })
  doctorId: string;

  @IsDateString({}, { message: "Data/hora inválida" })
  @IsNotEmpty({ message: "A data/hora é obrigatória" })
  dateTime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDTO {
  @IsDateString({}, { message: "Data/hora inválida" })
  @IsOptional()
  dateTime?: string;

  @IsEnum(AppointmentStatus, { message: "Status inválido" })
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
