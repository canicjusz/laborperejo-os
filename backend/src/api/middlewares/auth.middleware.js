import { getBanAndConfirmed } from "../services/user.service.js";
import * as yup from "yup";
import handler from "../utils/handler.js";

const requiredSessionID = yup.number().required().positive().integer();

const loginUnrequired = async (req, res, next) => {
  const ID = req.session?.ID;
  if (ID) {
    return res.status(401).json({ error: "Vi devas elsaluti" });
  }
  next();
};

const loginRequired = async (req, res, next) => {
  const ID = req.session?.ID;
  const [, error] = await handler(
    requiredSessionID.validate,
    requiredSessionID,
    ID
  );
  if (error) {
    res.status(401).json({ error: "Vi devas ensaluti" });
  } else {
    next();
  }
};

const bannedOrUnconfirmed = async (req, res, next) => {
  const ID = req.session?.ID;
  const [, validationError] = await handler(
    requiredSessionID.validate,
    requiredSessionID,
    ID
  );
  if (validationError) {
    return res.status(401).json({ error: "Vi devas ensaluti" });
  }
  const [data, prismaError] = await handler(getBanAndConfirmed, null, ID);
  if (prismaError) {
    return res.status(500).end();
  }
  if (!data) {
    res.status(400).json({ error: "Via uzanto ne ekzistas" });
  }
  if (data.ban || !data.confirmed) {
    res
      .status(401)
      // todo: add link
      .json({ error: "Via konto estas nekonfirmita aŭ forbarita" });
  } else {
    next();
  }
};

export { loginUnrequired, bannedOrUnconfirmed, loginRequired };
