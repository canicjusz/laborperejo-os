import * as yup from "yup";
import countries from "../../../../countries.js";
import categories from "../../../../categories.js";
import { companyID } from "./shared.js";

const getPageSchema = yup.object({
  q: yup.string(),
  p: yup.number().positive().integer().default(1),
  k: yup.string().matches(/^\d+((\,\d+)+)?$/),
  l: yup.string().matches(/^\d+((\,\d+)+)?$/),
  mo: yup.boolean(),
  a: yup.number().positive().integer(),
});

const createCompanySchema = yup.object({
  industry: yup.mixed().oneOf(categories).required(),
  name: yup.string().required().max(100),
  country: yup.mixed().oneOf(countries).required(),
  email: yup.string().email().required().max(320),
  address: yup.string().required().max(100),
});

const updateCompanySchema = yup.object({
  logo: yup
    .string()
    .matches(/^\/logo(.*)/)
    .required(),
  industry: yup.string().required().max(100),
  description: yup.string().required().max(8192),
  country: yup.mixed().oneOf(countries).required(),
  address: yup.string().required().max(100),
  phone: yup
    .string()
    .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/)
    .nullable(),
  email: yup.string().email().required().max(320),
  website: yup
    .string()
    .transform((string) => (string == "" ? null : string))
    .url("La ligilo ne estas valida.")
    .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
    .nullable(),
  li: yup
    .string()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?linkedin.com.*/)
    .max(500)
    .nullable(),
});

const companyIDSchema = yup.object({
  companyID,
});
export {
  getPageSchema,
  createCompanySchema,
  updateCompanySchema,
  companyIDSchema,
};
