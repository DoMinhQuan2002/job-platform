import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import {
  attachMySkill,
  createSkillCatalog,
  detachMySkill,
  listMySkills,
  listSkillCatalog,
  updateMySkill,
} from "./candidate-profiles.controller";

const skillsRouter = Router();

skillsRouter.get("/", listSkillCatalog);
skillsRouter.post("/", authenticate, createSkillCatalog);
skillsRouter.get("/me", authenticate, listMySkills);
skillsRouter.post("/me", authenticate, attachMySkill);
skillsRouter.put("/me/:id", authenticate, updateMySkill);
skillsRouter.delete("/me/:id", authenticate, detachMySkill);

export default skillsRouter;
