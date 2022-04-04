import { get } from "svelte/store";
import axios from "axios";
import { user, error } from "./stores";
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

const changeObservation = (ID, offer) => {
  let watchlist = get(user).watchlist;
  const isWatched = watchlist.some((offer) => offer.ID === ID);
  if (isWatched) {
    axios
      .delete(`/api/offers/${ID}/follow`)
      .then((res) => {
        const offerIndex = watchlist.findIndex((offer) => offer.ID === ID);
        watchlist.splice(offerIndex, 1);
        user.update((u) => {
          u.watchlist = watchlist;
          return u;
        });
      })
      .catch(error.change);
  } else {
    axios
      .post(`/api/offers/${ID}/follow`)
      .then((res) => {
        watchlist.push({
          ID,
          company: {
            logo: offer.company.logo,
          },
          title: offer.title,
          closed: offer.closed,
          close_at: offer.close_at,
        });
        user.update((u) => {
          u.watchlist = watchlist;
          return u;
        });
        console.log(get(user));
      })
      .catch(error.change);
  }
};

export {
  redirectIfNotLoggedIn,
  extractErrors,
  onlyClosed,
  redirectIfLoggedIn,
  redirectIfNotOwner,
  onlyOpened,
  getDate,
  changeObservation,
};
