import { Router } from "express";
import { SpecialtyController } from "../controllers/SpecialtyController";
import { validateDTO } from "../middlewares/validateDTO";
import { CreateSpecialtyDTO, UpdateSpecialtyDTO } from "../dtos/SpecialtyDTO";

const router = Router();
const controller = new SpecialtyController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", validateDTO(CreateSpecialtyDTO), controller.create);
router.put("/:id", validateDTO(UpdateSpecialtyDTO), controller.update);
router.delete("/:id", controller.delete);

export default router;
