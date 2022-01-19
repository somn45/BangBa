export const sessionMiddleware = (req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn;
  res.locals.loggedUser = req.session.loggedUser;
  next();
};
