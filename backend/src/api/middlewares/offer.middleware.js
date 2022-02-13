import { getAdministratorsByID } from "../services/offer.service.js";
import handler from "../utils/handler.js";

const ownerOnly = async (req, res, next) => {
  const offerID = req.params.offerID;
  const ID = req.session.ID;
  const [offer, error] = await handler(getAdministratorsByID, null, offerID);
  if (error) {
    return res.status(500).json({
      error:
        "Nedefinita servila eraro. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!offer) {
    return res.status(404).json({
      error: "Ĉi tiu paĝo ne ekzistas.",
    });
  }
  const isOwner = offer.company.administrators.some(
    (administrator) => administrator.ID === ID
  );
  if (isOwner) {
    next();
  } else {
    res.status(401).json({ error: "Vi ne rajtas redakti ĉi tiun oferton." });
  }
};

export { ownerOnly };
