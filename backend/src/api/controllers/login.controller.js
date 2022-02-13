const loginUnrequired = (req, res, next) => {
  const ID = req.session?.ID;
  if (ID) {
    return res.redirect(`/profiloj/${ID}`);
  }
  next();
};

export { loginUnrequired };
