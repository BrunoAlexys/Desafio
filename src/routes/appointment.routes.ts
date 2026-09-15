import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { validateDTO } from "../middlewares/validateDTO";
import { CreateAppointmentDTO, UpdateAppointmentDTO } from "../dtos/AppointmentDTO";

const router = Router();
const controller = new AppointmentController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.get("/doctor/:doctorId", controller.findByDoctorId);
router.get("/patient/:patientId", controller.findByPatientId);
router.post("/", validateDTO(CreateAppointmentDTO), controller.create);
router.put("/:id", validateDTO(UpdateAppointmentDTO), controller.update);
router.patch("/:id/cancel", controller.cancel);
router.delete("/:id", controller.delete);

export default router;
