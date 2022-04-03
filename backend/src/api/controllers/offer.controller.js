import {
  getPageByCursor,
  createByCompanyID,
  removeByID,
  updateByID,
  getByID,
  getPageByOffset,
  getCount,
  addFollowerByID,
  removeFollowerByID,
} from "../services/offer.service.js";
import { countFollowed } from "../services/user.service.js";
import countriesList from "../../../../countries.js";
import categoriesList from "../../../../categories.js";
import sanitizeHtml from "sanitize-html";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
const { Prisma } = prismaPkg;

const offsetPagination = async ({
  q: searchQuery,
  p: page,
  d: employmentTypes,
  m: arrangements,
  k: categories,
  l: countries,
  de: of,
  nm: onlyOpened,
}) => {
  const where = {};
  if (onlyOpened) {
    where.closed = false;
  }
  if (searchQuery) {
    where.title = {
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
      categories: { array_contains: categoriesList[Number(i)] },
    }));
  }
  if (arrangements) {
    where.arrangement = { in: arrangements.split(",") };
  }
  if (employmentTypes) {
    where.employment = { in: employmentTypes.split(",") };
  }
  if (of) {
    where.company_ID = of;
  }
  const take = 10;
  let skip = (page - 1) * take;
  const count = await getCount(where);
  const pages = Math.ceil(count / 10);
  const offers = await getPageByOffset(skip, take, where);
  return { offers, pages };
};

const getPage = async (req, res) => {
  try {
    const offers = await offsetPagination(req.query);
    res.json(offers);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis sendi liston de ofertoj. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const create = async (req, res) => {
  const { companyID, ...data } = req.body;
  const sanitizedDescription = sanitizeHtml(data.description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  data.description = sanitizedDescription;
  const [offer, error] = await handler(
    createByCompanyID,
    null,
    companyID,
    data
  );
  if (error) {
    console.log(error);
    return res.status(500).json({
      error:
        "Ni ial ne povis krei la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.json(offer);
};

const remove = async (req, res) => {
  const offerID = req.params.offerID;
  const [offer, error] = await handler(removeByID, null, offerID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res.status(404).json({
        error: "Oferto kun ĉi tiu identigilo ne ekzistas.",
      });
    }
    console.log(error);
    return res.status(500).json({
      error:
        "Ni ial ne povis forigi la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.json(offer);
};

const editSeveral = async (req, res) => {
  const arr = req.body.array;

  await arr.forEach(async ({ ID, closed, close_at }) => {
    const [, error] = await handler(updateByID, null, ID, {
      closed,
      close_at,
    });
    if (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2018"
      ) {
        return res.status(404).json({
          error: "Oferto kun ĉi tiu identigilo ne ekzistas.",
        });
      }
      console.log(error);
      return res.status(500).json({
        error:
          "Ni ial ne povis ĝisdatigi la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
  });
  res.json("La ofertoj sukcese ĝisdatiĝis.");
};

const edit = async (req, res) => {
  const offerID = req.params.offerID;
  const { ...data } = req.body;
  const sanitizedDescription = sanitizeHtml(data.description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  data.description = sanitizedDescription;
  const [offer, error] = await handler(updateByID, null, offerID, data);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res.status(404).json({
        error: "Oferto kun ĉi tiu identigilo ne ekzistas.",
      });
    }
    console.error(error);
    return res.status(500).json({
      error:
        "Ni ial ne povis ĝisdatigi la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.json(offer);
};

const get = async (req, res) => {
  const sessionID = req.session?.ID;
  const offerID = req.params.offerID;
  const [offer, error] = await handler(getByID, null, offerID);
  if (error) {
    console.log(error);
    return res.status(500).json({
      error:
        "Ni ial ne povis akiri la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!offer) {
    return res.status(404).json({
      error: "Oferto kun ĉi tiu identigilo ne ekzistas.",
    });
  }
  const ownerIndex = offer.company.administrators.some(
    (administrator) => administrator.ID === sessionID
  );
  if (ownerIndex) {
    offer.isOwner = true;
  }
  delete offer.company.administrators;
  res.json(offer);
};

const addFollower = async (req, res) => {
  try {
    const offerID = req.params.ID;
    const userID = req.session.ID;
    const [user, countError] = await handler(countFollowed, null, userID);
    if (user === null) {
      return res.status(404).json({
        error: "Uzanto kun ĉi tiu identigilo ne ekzistas.",
      });
    }
    if (countError) {
      throw countError;
    }
    const amountOfFollowed = user._count.watchlist;
    if (amountOfFollowed > 29) {
      return res.status(422).json({
        error: "Oni povas observi nur ĝis 30 ofertojn.",
      });
    }
    const [, addError] = await handler(addFollowerByID, null, offerID, userID);
    if (addError) {
      if (
        addError instanceof Prisma.PrismaClientKnownRequestError &&
        addError.code === "P2018"
      ) {
        return res.status(404).json({
          error: "Oferto kun ĉi tiu identigilo ne ekzistas.",
        });
      }
      throw addError;
    }
    res.send("Farite :)");
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis aldoni la sekvanton al la oferto. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const removeFollower = async (req, res) => {
  const offerID = req.params.ID;
  const userID = req.session.ID;
  const [, error] = await handler(removeFollowerByID, null, offerID, userID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res.status(404).json({
          error: "Oferto kun ĉi tiu identigilo ne ekzistas.",
        });
      } else if (error.code === "P2025") {
        return res.status(404).json({
          error: "Uzanto kun ĉi tiu identigilo ne ekzistas.",
        });
      }
    }
    console.log(error);
    return res.status(500).json({
      error:
        "Ni ial ne povis forigi la sekvanton de la oferto. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.send("Farite :)");
};

export {
  getPage,
  create,
  remove,
  editSeveral,
  edit,
  get,
  addFollower,
  removeFollower,
};
