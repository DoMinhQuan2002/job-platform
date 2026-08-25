import { Router } from "express";
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
skillsRouter.post("/", createSkillCatalog);
skillsRouter.get("/me", listMySkills);
skillsRouter.post("/me", attachMySkill);
skillsRouter.put("/me/:id", updateMySkill);
skillsRouter.delete("/me/:id", detachMySkill);

export default skillsRouter;
