import Cafe from '../models/Cafe';
import User from '../models/User';

const REGISTER_PAGE = 'cafe/register';

export const home = async (req, res) => {
  const cafes = await Cafe.find();
  res.render('home', { cafes });
};

export const getRegister = (req, res) => {
  res.render(REGISTER_PAGE);
};

export const postRegister = async (req, res) => {
  // form의 입력값 받아오기
  const { name, description, location, theme, level, rating } = req.body;
  const { file } = req;
  const backgroundUrl = file ? file.path : '';

  // 카페의 난이도가 1~5 사이인지 확인
  if ((level && level <= 0) || level > 5) {
    return res.status(400).render(REGISTER_PAGE, {
      levelErrorMsg: '카페의 난이도는 1에서 5 사이입니다.',
    });
  }

  const user = req.session.loggedUser;
  const cafe = await Cafe.create({
    name,
    description,
    location,
    theme: theme.split(','),
    meta: {
      level,
    },
    backgroundUrl,
    owner: user._id,
  });
  console.log(cafe);
  await User.findByIdAndUpdate(user._id, {
    registeredCafes: [...user.registeredCafes, cafe._id],
  });
  res.redirect('/');
};

export const detail = async (req, res) => {
  // 카페의 정보 DB에서 불러오기
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId)
    .populate('owner')
    .populate({
      path: 'comments',
      populate: {
        path: 'owner',
      },
    });

  // 카페의 댓글 불러오기
  const comments = cafe.comments;
  if (!cafe) {
    return res.status(404).render('404');
  }
  res.render('cafe/detail', { cafe, comments });
};

export const getEdit = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  if (!cafe) {
    return res.status(404).render('404');
  }
  res.render('cafe/edit', { cafe });
};

export const postEdit = async (req, res) => {
  // form의 입력값 받아오기
  const { cafeId } = req.params;
  const { name, description, location, theme, level, rating } = req.body;
  const { file } = req;
  let { backgroundUrl } = await Cafe.findById(cafeId);
  backgroundUrl = file ? file.path : backgroundUrl ? backgroundUrl : '';

  // 카페의 난이도가 1~5 사이인지 확인
  if (level < 1 || level > 5) {
    return res.status(400).render('cafe/edit', {
      levelErrorMsg: '카페의 난이도는 1에서 5 사이입니다.',
    });
  }

  await Cafe.findByIdAndUpdate(cafeId, {
    name,
    description,
    location,
    theme: theme.split(','),
    meta: {
      level,
    },
    backgroundUrl,
  });
  res.redirect(`/cafes/${cafeId}`);
};

export const deleteCafe = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  if (!cafe) {
    return res.status(404).render('404');
  }
  await Cafe.findByIdAndDelete(cafeId);
  res.redirect('/');
};
