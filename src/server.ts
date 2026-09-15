import app from "./app";
import { AppDataSource } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Banco de dados conectado com sucesso!");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👤 Pacientes:    http://localhost:${PORT}/api/patients`);
      console.log(`🩺 Médicos:      http://localhost:${PORT}/api/doctors`);
      console.log(`📅 Agendamentos: http://localhost:${PORT}/api/appointments`);
      console.log(`🏥 Especialidades: http://localhost:${PORT}/api/specialties`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });
