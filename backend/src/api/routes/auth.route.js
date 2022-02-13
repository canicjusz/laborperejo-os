import { Router } from "express";
import {
  loginRequired,
  loginUnrequired,
} from "../middlewares/status.middleware.js";
import {
  confirmEmail,
  passwordReset,
  deleteSession,
  sendPasswordReset,
  login,
  register,
  editPassword,
  getSession,
  resendConfirmationEmail,
} from "../controllers/auth.controller.js";
import { bannedOrUnconfirmed } from "../middlewares/status.middleware.js";
import { ownerOnly } from "../middlewares/profile.middleware.js";
import {
  validateParams,
  validateBody,
} from "../middlewares/validate.middleware.js";
import { IDSchema, tokenSchema } from "../validators.js";
import * as yup from "yup";
import countries from "../../../../countries.js";
const levels = ["baznivele", "meznivele", "altnivele", "flue", "denaske"];

const registerSchema = yup.object({
  name: yup.string().required().trim().max(100),
  email: yup.string().email().required().max(320),
  country: yup.mixed().oneOf(countries).required(),
  place: yup.string().required().trim().max(100),
  languages: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required(),
        level: yup.mixed().oneOf(levels).required(),
      })
    )
    .min(1)
    .max(50),
  password: yup
    .string()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/
    )
    .required(),
});

const loginSchema = yup.object({
  email: yup.string().required(),
  password: yup.string().required(),
  saveSession: yup.boolean().required(),
});

const editPasswordSchema = yup.object({
  curr: yup.string().required(),
  new: yup
    .string()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/
    )
    .required(),
});

const emailSchema = yup.object({
  email: yup.string().email().required(),
});

const passwordResetSchema = yup.object({
  id: yup.number().positive().integer().required(),
  token: yup.string().required(),
  password: yup
    .string()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/
    )
    .required(),
});

const router = Router();

router.put(
  "/api/account/confirmation",
  loginUnrequired,
  validateBody(tokenSchema),
  confirmEmail
);

router.delete("/api/session", loginRequired, deleteSession);

router.get("/api/session", getSession);

router.post("/api/session", loginUnrequired, validateBody(loginSchema), login);

router.post(
  "/api/users",
  loginUnrequired,
  validateBody(registerSchema),
  register
);

router.post(
  "/api/account/password",
  loginUnrequired,
  validateBody(emailSchema),
  sendPasswordReset
);

router.put(
  "/api/account/password",
  loginUnrequired,
  validateBody(passwordResetSchema),
  passwordReset
);

router.post(
  "/api/account/confirmation",
  loginUnrequired,
  validateBody(emailSchema),
  resendConfirmationEmail
);

router.put(
  "/api/account/:ID/password",
  validateParams(IDSchema),
  bannedOrUnconfirmed,
  ownerOnly,
  validateBody(editPasswordSchema),
  editPassword
);

export default router;
