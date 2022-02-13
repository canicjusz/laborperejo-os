import { Router } from "express";
import {
  bannedOrUnconfirmed,
  loginRequired,
} from "../middlewares/status.middleware.js";
import { ownerOnly } from "../middlewares/company.middleware.js";
import {
  get,
  getPage,
  create,
  remove,
  edit,
  addAdministrator,
  removeAdministrator,
} from "../controllers/company.controller.js";
import { companyUpload } from "../utils/multer.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { companyIDSchema, userIDAndcompanyID } from "../validators.js";
import * as yup from "yup";
import countries from "../../../../countries.js";
import categories from "../../../../categories.js";

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

const updateCompanyScheam = yup.object({
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
});

const router = Router();

router.get("/api/companies", validateQuery(getPageSchema), getPage);

router.post(
  "/api/companies",
  loginRequired,
  bannedOrUnconfirmed,
  validateBody(createCompanySchema),
  create
);

router.get("/api/companies/:companyID", validateParams(companyIDSchema), get);

router.delete(
  "/api/companies/:companyID",
  validateParams(companyIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  remove
);

router.put(
  "/api/companies/:companyID",
  validateParams(companyIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  companyUpload,
  validateBody(updateCompanyScheam),
  edit
);

router.post(
  "/api/companies/:companyID/administrator/:userID",
  validateParams(userIDAndcompanyID),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  addAdministrator
);

router.delete(
  "/api/companies/:companyID/administrator/:userID",
  validateParams(userIDAndcompanyID),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  removeAdministrator
);

export default router;
