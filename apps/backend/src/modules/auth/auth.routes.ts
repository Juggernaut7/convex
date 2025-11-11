import { Router, type Router as ExpressRouter } from "express";
import { register, login } from "./auth.controller.js";

const router: ExpressRouter = Router();

router.post("/register", register);
router.post("/login", login);

export const authRoutes: ExpressRouter = router;

