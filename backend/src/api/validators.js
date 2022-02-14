import * as yup from "yup";
const userID = yup
  .number()
  .typeError("Identigilo de la uzanto estu numero.")
  .positive("Identigilo estu pozitiva.")
  .integer("Identigilo estu entjero.")
  .required("Mankas identigilo de la uzanto en la ligilo");

const companyID = yup
  .number()
  .typeError("Identigilo de la firmao estu numero.")
  .positive("Identigilo estu pozitiva.")
  .integer("Identigilo estu entjero.")
  .required("Mankas identigilo de la uzanto en la ligilo.");

const IDSchema = yup.object({
  ID: userID,
});

const companyIDSchema = yup.object({
  companyID,
});

const offerIDSchema = yup.object({
  offerID: yup
    .number()
    .typeError("Identigilo de la oferto estu numero.")
    .positive("Identigilo estu pozitiva.")
    .integer("Identigilo estu entjero.")
    .required("Mankas identigilo de la uzanto en la ligilo."),
});

const tokenSchema = yup.object({
  token: yup.string().required("Mankas ĵetono en la ligilo."),
});

const userIDAndcompanyID = yup.object({
  userID: userID,
  companyID: companyID,
});

export {
  userIDAndcompanyID,
  IDSchema,
  companyIDSchema,
  tokenSchema,
  offerIDSchema,
};
