import { Router } from "express";
import { DoctorController } from "../controllers/DoctorController";
import { validateDTO } from "../middlewares/validateDTO";
import { CreateDoctorDTO, UpdateDoctorDTO } from "../dtos/DoctorDTO";

const router = Router();
const controller = new DoctorController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", validateDTO(CreateDoctorDTO), controller.create);
router.put("/:id", validateDTO(UpdateDoctorDTO), controller.update);
router.delete("/:id", controller.delete);

export default router;
