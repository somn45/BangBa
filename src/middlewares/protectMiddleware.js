import Cafe from '../models/Cafe';
import User from '../models/User';

export const protectMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  next();
};

export const guestPublicMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return res.redirect('/');
  }
  next();
};

export const ownerProtectMiddleware = async (req, res, next) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId).populate('owner');
  if (!cafe) {
    return res.status(404).render('404');
  }
  if (cafe.owner.username !== req.session.loggedUser.username) {
    return res.redirect(`/cafes/${cafe._id}`);
  }
  next();
};

export const preventBreakInMiddleware = async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render('404');
  }
  if (user.uid !== req.session.loggedUser.uid) {
    return res.redirect(`/users/${user._id}`);
  }
  next();
};
