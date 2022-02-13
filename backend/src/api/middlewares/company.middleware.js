import { getAdministratorsByID } from "../services/company.service.js";
import handler from "../utils/handler.js";

const ownerOnly = async (req, res, next) => {
  const companyID = req.params.companyID || req.body.companyID;
  const ID = req.session.ID;
  const [company, error] = await handler(
    getAdministratorsByID,
    null,
    companyID
  );
  if (error) {
    return res.status(500).json({
      error:
        "Nedefinita servila eraro. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!company) {
    return res.status(404).json({
      error: "Ĉi tiu paĝo ne ekzistas.",
    });
  }
  const isOwner = company.administrators.some(
    (administrator) => administrator.ID === ID
  );
  if (isOwner) {
    next();
  } else {
    res.status(401).json({ error: "Vi ne rajtas redakti ĉi tiun firmaon." });
  }
};

export { ownerOnly };
