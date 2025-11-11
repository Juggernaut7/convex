import { Router, type Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import { list, get, create, update, remove, resolveMarket } from "./market.controller.js";

const router: ExpressRouter = Router();

router.get("/", list);
router.get("/:id", get);
router.post("/", authenticate(), authorize("admin", "creator"), create);
router.patch("/:id", authenticate(), authorize("admin", "creator"), update);
router.delete("/:id", authenticate(), authorize("admin"), remove);
router.post("/:id/resolve", authenticate(), authorize("admin"), resolveMarket);

export const marketRoutes: ExpressRouter = router;

