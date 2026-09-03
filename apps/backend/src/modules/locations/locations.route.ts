import { Router } from "express";
import { locationsController } from "./locations.controller";

const locationsRouter = Router();

locationsRouter.get("/provinces", locationsController.listProvinces);
locationsRouter.get("/provinces/:provinceCode/wards", locationsController.listWards);
locationsRouter.get("/wards/:code", locationsController.getWard);

export default locationsRouter;
