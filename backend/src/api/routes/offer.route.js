import { Router } from "express";
import {
  bannedOrUnconfirmed,
  loginRequired,
} from "../middlewares/auth.middleware.js";
import { ownerOnly as companyOwnerOnly } from "../middlewares/company.middleware.js";
import { ownerOnly } from "../middlewares/offer.middleware.js";
import {
  getPage,
  create,
  remove,
  editSeveral,
  edit,
  get,
  addFollower,
  removeFollower,
} from "../controllers/offer.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { userIDSchema } from "../validators/profile.validators.js";
import {
  createOfferSchema,
  updateSeveralSchema,
  offerIDSchema,
  updateOfferSchema,
  getPageSchema,
} from "../validators/offer.validators.js";

const router = Router();

router.get("/api/offers", validateQuery(getPageSchema), getPage);

router.post(
  "/api/offers/:ID/follow",
  validateParams(userIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  addFollower
);

router.delete(
  "/api/offers/:ID/follow",
  validateParams(userIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  removeFollower
);

router.post(
  "/api/offers",
  loginRequired,
  bannedOrUnconfirmed,
  companyOwnerOnly,
  validateBody(createOfferSchema),
  create
);

router.put(
  "/api/offers",
  loginRequired,
  bannedOrUnconfirmed,
  companyOwnerOnly,
  validateBody(updateSeveralSchema),
  editSeveral
);

router.get("/api/offers/:offerID", validateParams(offerIDSchema), get);

router.delete(
  "/api/offers/:offerID",
  validateParams(offerIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  remove
);

router.put(
  "/api/offers/:offerID",
  validateParams(offerIDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  ownerOnly,
  validateBody(updateOfferSchema),
  edit
);

export default router;
