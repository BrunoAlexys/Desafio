import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateSpecialtyDTO {
  @IsString()
  @IsNotEmpty({ message: "O nome da especialidade é obrigatório" })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSpecialtyDTO {
  @IsString()
  @IsNotEmpty({ message: "O nome da especialidade é obrigatório" })
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
