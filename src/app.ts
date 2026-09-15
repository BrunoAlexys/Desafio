import "reflect-metadata";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota de health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "API de Agendamento de Consultas está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api", routes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;
