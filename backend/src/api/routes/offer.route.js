import { Router } from "express";
import {
  bannedOrUnconfirmed,
  loginRequired,
} from "../middlewares/status.middleware.js";
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
// you should pick either IDSchema or offerIDSchema
import { IDSchema, offerIDSchema } from "../validators.js";
import * as yup from "yup";
import countries from "../../../../countries.js";
import categories from "../../../../categories.js";

const workArrangements = ["hejme", "laboreje", "hibride"];
const employmentTypes = ["plentempa", "parttempa", "aldona"];

const createOfferSchema = yup.object({
  companyID: yup.number().integer().positive().required(),
  title: yup.string().required().max(50),
  description: yup.string().required().max(8192),
  salary: yup.boolean().required(),
  reward: yup.string().required().max(70),
  arrangement: yup.mixed().oneOf(workArrangements).required(),
  employment: yup.mixed().oneOf(employmentTypes).required(),
  country: yup.mixed().oneOf(countries).required(),
  place: yup.string().required().max(100),
  categories: yup
    .array()
    .of(yup.mixed().oneOf(categories))
    .min(1)
    .max(3)
    .required(),
  closed: yup.boolean().required(),
  close_at: yup.date().when("closed", {
    is: true,
    then: (schema) => schema.nullable(),
    otherwise: (schema) =>
      schema.required().transform((string) => new Date(string)),
  }),
});

const updateOfferSchema = yup.object({
  title: yup.string().required().max(50),
  description: yup.string().required().max(8192),
  salary: yup.boolean().required(),
  reward: yup.string().required().max(70),
  arrangement: yup.mixed().oneOf(workArrangements).required(),
  employment: yup.mixed().oneOf(employmentTypes).required(),
  country: yup.mixed().oneOf(countries).required(),
  place: yup.string().required().max(100),
  categories: yup.array().of(yup.mixed().oneOf(categories)).min(1).max(3),
  closed: yup.boolean().required(),
  close_at: yup.date().when("closed", {
    is: true,
    then: (schema) => schema.nullable(),
    otherwise: (schema) =>
      schema.required().transform((string) => new Date(string)),
  }),
});

const updateSeveralSchema = yup.object({
  array: yup.array().of(
    yup.object({
      ID: yup.number().required(),
      closed: yup.boolean().required(),
      close_at: yup.date().when("closed", {
        is: true,
        then: (schema) => schema.nullable(),
        otherwise: (schema) =>
          schema.required().transform((string) => new Date(string)),
      }),
    })
  ),
  companyID: yup.number().integer().positive().required(),
});

//todo: getPageSchema

const getPageSchema = yup.object().shape({
  q: yup.string().ensure(),
  p: yup.number().positive().integer().default(1),
  d: yup
    .string()
    .matches(
      /(plentempa|parttempa|aldona)((\,(plentempa|parttempa|aldona))+)?$/
    ),
  m: yup
    .string()
    .matches(/(hejme|laboreje|hibride)((\,(hejme|laboreje|hibride))+)?$/),
  k: yup.string().matches(/^\d+((\,\d+)+)?$/),
  l: yup.string().matches(/^\d+((\,\d+)+)?$/),
  de: yup.number().positive().integer(),
  nm: yup.boolean().default(true),
});

const router = Router();

router.get("/api/offers", validateQuery(getPageSchema), getPage);

router.post(
  "/api/offers/:ID/follow",
  validateParams(IDSchema),
  loginRequired,
  bannedOrUnconfirmed,
  addFollower
);

router.delete(
  "/api/offers/:ID/follow",
  validateParams(IDSchema),
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
