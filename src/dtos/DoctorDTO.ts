import { IsString, IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class CreateDoctorDTO {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "O CRM é obrigatório" })
  crm: string;

  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "O email é obrigatório" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "O telefone é obrigatório" })
  phone: string;

  @IsUUID("4", { message: "ID da especialidade inválido" })
  @IsNotEmpty({ message: "A especialidade é obrigatória" })
  specialtyId: string;
}

export class UpdateDoctorDTO {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório" })
  name?: string;

  @IsEmail({}, { message: "Email inválido" })
  email?: string;

  @IsString()
  phone?: string;

  @IsUUID("4", { message: "ID da especialidade inválido" })
  specialtyId?: string;
}
