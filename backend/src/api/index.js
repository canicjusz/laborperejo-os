import { Router } from "express";
import profileRouter from "./routes/profile.route.js";
import authRouter from "./routes/auth.route.js";
import companyRouter from "./routes/company.route.js";
import offerRouter from "./routes/offer.route.js";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "../prisma.js";

const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: 2 * 60 * 1000, //ms
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

const expressSession = session({
  secret: "ab",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
  },
});

const router = Router();

router.use(expressSession);

router.use(profileRouter);
router.use(authRouter);
router.use(companyRouter);
router.use(offerRouter);

export default router;
