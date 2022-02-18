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

const tokenSchema = yup.object({
  token: yup.string().required("Mankas ĵetono en la ligilo."),
});

export {
  passwordResetSchema,
  emailSchema,
  editPasswordSchema,
  loginSchema,
  registerSchema,
  tokenSchema,
};
