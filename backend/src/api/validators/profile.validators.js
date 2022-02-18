import * as yup from "yup";
import countries from "../../../../countries.js";
import { userID } from "./shared.js";

const editCurrentSchema = yup.object({
  content: yup.string().required().max(8192),
  phone: yup
    .string()
    .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/)
    .nullable(),
  email: yup.string().email().required().max(320),
  fb: yup
    .string()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?facebook.com.*/)
    .max(500)
    .nullable(),
  vk: yup
    .string()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?vk.com.*/)
    .max(500)
    .nullable(),
  mv: yup
    .string()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?miavivo.net.*/)
    .max(500)
    .nullable(),
  searching: yup.boolean().required(),
  job: yup
    .string()
    .max(100)
    .when("searching", {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.nullable(),
    }),
  avatar: yup.string().required(),
  place: yup.string().max(100).required(),
  country: yup.mixed().oneOf(countries),
  resume: yup.string().nullable(),
});

const getPageSchema = yup.object({
  q: yup.string().ensure(),
  p: yup.number().positive().integer().default(1),
  s: yup.boolean(),
  l: yup.string().matches(/^\d+((\,\d+)+)?$/),
  na: yup.number().positive().integer(),
});

const userIDSchema = yup.object({
  ID: userID,
});

export { editCurrentSchema, getPageSchema, userIDSchema };
