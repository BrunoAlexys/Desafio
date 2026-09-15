import { IsString, IsEmail, IsNotEmpty, Matches, IsDateString } from "class-validator";

export class CreatePatientDTO {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório" })
  name: string;

  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "O email é obrigatório" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "O telefone é obrigatório" })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: "O CPF é obrigatório" })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, {
    message: "CPF deve estar no formato 000.000.000-00 ou 00000000000",
  })
  cpf: string;

  @IsDateString({}, { message: "Data de nascimento inválida" })
  @IsNotEmpty({ message: "A data de nascimento é obrigatória" })
  birthDate: string;
}

export class UpdatePatientDTO {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório" })
  name?: string;

  @IsEmail({}, { message: "Email inválido" })
  email?: string;

  @IsString()
  phone?: string;

  @IsDateString({}, { message: "Data de nascimento inválida" })
  birthDate?: string;
}
