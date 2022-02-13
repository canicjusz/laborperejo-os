import {
  getByID,
  getSeveralByID,
  removeByID,
  updateByID,
  createByID,
  getPageByOffset,
  getCount,
  removeAdministratorByID,
  addAdministratorByID,
} from "../services/company.service.js";
import { getCount as getCountOffer } from "../services/offer.service.js";
import categoriesList from "../../../../categories.js";
import countriesList from "../../../../countries.js";
import sanitizeHtml from "sanitize-html";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
const { Prisma } = prismaPkg;

const getPage = async (req, res) => {
  try {
    const {
      q: searchQuery,
      p: page,
      k: categories,
      l: countries,
      mo: havingOpenedOnly,
      a: administrator,
    } = req.query;

    const where = {};
    if (searchQuery) {
      where.name = {
        search: searchQuery,
      };
      where.description = {
        search: searchQuery,
      };
    }
    if (countries) {
      where.country = {
        in: countries.split(",").map((i) => countriesList[Number(i)]),
      };
    }
    if (categories) {
      where.OR = categories.split(",").map((i) => ({
        industry: categoriesList[Number(i)],
      }));
    }
    if (havingOpenedOnly) {
      where.offers = {
        some: {
          closed: false,
        },
      };
    }
    if (administrator) {
      where.administrators = {
        some: {
          ID: administrator,
        },
      };
    }
    const take = 10;
    let skip = (page - 1) * take;
    const count = await getCount(where);
    const pages = Math.ceil(count / 10);
    const companies = await getPageByOffset(skip, take, where);
    res.json({ companies, pages });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis sendi liston de firmaoj. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const get = async (req, res) => {
  try {
    const ID = req.session?.ID;
    const companyID = req.params.companyID;
    const [company, error] = await handler(getByID, null, companyID);
    if (error) {
      throw error;
    }
    if (!company) {
      return res.status(404).json({
        error: "Firmao kun ĉi tiu identigilo ne ekzistas.",
      });
    }
    const ownerIndex = company.administrators.findIndex(
      (administrator) => administrator.ID === ID
    );
    if (ownerIndex > -1) {
      company.isOwner = true;
      company.offersNumber = await getCountOffer({ company_ID: companyID });
      company.offersOpenedNumber = await getCountOffer({
        company_ID: companyID,
        closed: false,
      });
      company.administrators.splice(ownerIndex, 1);
    } else {
      delete company.administrators;
    }
    res.json(company);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis sendi informojn pri la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const create = async (req, res) => {
  const sessionID = req.session.ID;
  const [company, error] = await handler(createByID, null, sessionID, req.body);
  if (error) {
    return res.status(500).json({
      error:
        "Ni ial ne povis krei la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.json(company);
};

const remove = async (req, res) => {
  const companyID = req.params.companyID;
  const [, error] = await handler(removeByID, null, companyID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res.status(404).json({
        error: "Firmao kun ĉi tiu identigilo ne ekzistas.",
      });
    }
    console.error(error);
    return res.status(500).json({
      error:
        "Ni ial ne povis forigi la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.send("Farite");
};

const edit = async (req, res) => {
  const data = req.body.json;
  const companyID = req.params.companyID;
  const sanitizedDescription = sanitizeHtml(data.description);
  data.description = sanitizedDescription;
  const [, error] = await handler(updateByID, null, companyID, data);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res.status(404).json({
        error: "Firmao kun ĉi tiu identigilo ne ekzistas.",
      });
    }
    res.status(500).json({
      error:
        "Ni ial ne povis redakti la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.send("Farite");
};

const addAdministrator = async (req, res) => {
  const { companyID, userID } = req.params;
  const sessionUserID = req.session.ID;
  if (sessionUserID === userID) {
    return res.status(400).json({
      error: "Vi ne povas vin mem forigi, petu vian kolegon fari tion.",
    });
  }
  const [, error] = await handler(
    addAdministratorByID,
    null,
    companyID,
    userID
  );
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res.status(404).json({
          error: "Firmao kun ĉi tiu identigilo ne ekzistas.",
        });
      } else if (error.code === "P2025") {
        return res.status(404).json({
          error: "Uzanto kun ĉi tiu identigilo ne ekzistas.",
        });
      }
    }
    res.status(500).json({
      error:
        "Ni ial ne povis aldoni la administranton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.send("Farite");
};

const removeAdministrator = async (req, res) => {
  const { companyID, userID } = req.params;
  const sessionUserID = req.session.ID;
  if (sessionUserID === userID) {
    return res.status(400).json({
      error: "Vi ne povas vin mem forigi, petu vian kolegon fari tion.",
    });
  }
  const [, error] = await handler(
    removeAdministratorByID,
    null,
    companyID,
    userID
  );
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res.status(404).json({
          error: "Firmao kun ĉi tiu identigilo ne ekzistas.",
        });
      } else if (error.code === "P2025") {
        return res.status(404).json({
          error: "Uzanto kun ĉi tiu identigilo ne ekzistas.",
        });
      }
    }
    res.status(500).json({
      error:
        "Ni ial ne povis forigi la administranton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.send("Farite");
};

export {
  get,
  getPage,
  create,
  remove,
  edit,
  addAdministrator,
  removeAdministrator,
};
