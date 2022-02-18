import { Router } from "express";
import {
  bannedOrUnconfirmed,
  loginRequired,
} from "../middlewares/auth.middleware.js";
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
import {
  companyIDSchema,
  getPageSchema,
  createCompanySchema,
  updateCompanySchema,
} from "../validators/company.validators.js";
import { userIDAndcompanyIDSchema } from "../validators/mixed.validators.js";

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
  validateBody(updateCompanySchema),
  edit
);

router.post(
  "/api/companies/:companyID/administrator/:userID",
  validateParams(userIDAndcompanyIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  addAdministrator
);

router.delete(
  "/api/companies/:companyID/administrator/:userID",
  validateParams(userIDAndcompanyIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  removeAdministrator
);

export default router;
