import { get } from "svelte/store";
import { user } from "./stores";
import { navigate } from "svelte-routing";

const extractErrors = (err) => {
  return err.inner.reduce(
    (acc, err) => ({ ...acc, [err.path]: err.message }),
    {}
  );
};

const onlyClosed = (offers) => offers.filter((offer) => offer.closed);

const onlyOpened = (offers) => offers.filter((offer) => !offer.closed);

const redirectIfLoggedIn = (path = "/") => {
  const currUser = get(user);
  if (currUser) {
    navigate(path, { replace: true });
  }
};

const redirectIfNotLoggedIn = (path = "/") => {
  const currUser = get(user);
  if (!currUser) {
    navigate(path, { replace: true });
  } else {
    return true;
  }
};

const redirectIfNotOwner = (companyID) => {
  const currUser = get(user);
  currUser.companies.some((company) => company.ID === companyID);
};

const months = [
  "januaro",
  "februaro",
  "marto",
  "aprilo",
  "majo",
  "junio",
  "julio",
  "aŭgusto",
  "septembro",
  "oktobro",
  "novembro",
  "decembro",
];

const getDate = (string) => {
  const date = new Date(string);
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  return `la ${day}-an de ${months[monthIndex]} ${year}`;
};

export {
  redirectIfNotLoggedIn,
  extractErrors,
  onlyClosed,
  redirectIfLoggedIn,
  redirectIfNotOwner,
  onlyOpened,
  getDate,
};
