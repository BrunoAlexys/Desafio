import { Router } from "express";
import { PatientController } from "../controllers/PatientController";
import { validateDTO } from "../middlewares/validateDTO";
import { CreatePatientDTO, UpdatePatientDTO } from "../dtos/PatientDTO";

const router = Router();
const controller = new PatientController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", validateDTO(CreatePatientDTO), controller.create);
router.put("/:id", validateDTO(UpdatePatientDTO), controller.update);
router.delete("/:id", controller.delete);

export default router;
