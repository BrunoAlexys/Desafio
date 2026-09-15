import { Router } from "express";
import patientRoutes from "./patient.routes";
import doctorRoutes from "./doctor.routes";
import appointmentRoutes from "./appointment.routes";
import specialtyRoutes from "./specialty.routes";

const router = Router();

router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/specialties", specialtyRoutes);

export default router;
