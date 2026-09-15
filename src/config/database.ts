import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Patient } from "../entities/Patient";
import { Doctor } from "../entities/Doctor";
import { Appointment } from "../entities/Appointment";
import { Specialty } from "../entities/Specialty";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "agendamento_consultas",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [Patient, Doctor, Appointment, Specialty],
  migrations: [],
  subscribers: [],
});
