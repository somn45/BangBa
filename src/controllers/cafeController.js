import Cafe from '../models/Cafe';

export const home = async (req, res) => {
  const cafes = await Cafe.find();
  res.render('home', { cafes });
};

export const getRegister = (req, res) => {
  res.render('cafe/register');
};

export const postRegister = async (req, res) => {
  const { name, description, location, theme, level, rating } = req.body;
  if (level <= 0 || level > 5) {
    return res
      .status(400)
      .render('cafe/register', { levelErrorMsg: '카페의 난이도는 1에서 5 사이입니다.' });
  }
  if (rating <= 0 || rating > 10) {
    return res
      .status(400)
      .render('cafe/register', { ratingErrorMsg: '카페의 평점은 1에서 10 사이입니다.' });
  }
  const registeredCafe = await Cafe.create({
    name,
    description,
    location,
    theme: theme.split(','),
    meta: {
      level,
      rating,
    },
  });
  console.log(registeredCafe);
  res.redirect('/');
};

export const detail = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  res.render('cafe/detail', { cafe });
};

export const getEdit = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  res.render('cafe/edit', { cafe });
};

export const postEdit = async (req, res) => {
  const { cafeId } = req.params;
  const { name, description, location, theme, level, rating } = req.body;
  if (level <= 0 || level > 5) {
    return res
      .status(400)
      .render('cafe/register', { levelErrorMsg: '카페의 난이도는 1에서 5 사이입니다.' });
  }
  if (rating <= 0 || rating > 10) {
    return res
      .status(400)
      .render('cafe/register', { ratingErrorMsg: '카페의 평점은 1에서 10 사이입니다.' });
  }
  const cafe = await Cafe.findByIdAndUpdate(cafeId, {
    name,
    description,
    location,
    theme: theme.split(','),
    meta: {
      level,
      rating,
    },
  });
  res.redirect(`/cafes/${cafeId}`);
};

export const deleteCafe = async (req, res) => {
  const { cafeId } = req.params;
  await Cafe.findByIdAndDelete(cafeId);
  res.redirect('/');
};
