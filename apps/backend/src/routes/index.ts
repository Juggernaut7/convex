import { Router, type Router as ExpressRouter } from "express";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { marketRoutes } from "../modules/markets/market.routes.js";

const router: ExpressRouter = Router();

router.use("/auth", authRoutes);
router.use("/markets", marketRoutes);

export const routes: ExpressRouter = router;

