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
    theme,
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

export const search = async (req, res) => {
  let cafes, sortBy;

  // 검색에 필요한 변수 불러오기
  const { isDetail, keyword, theme, order } = req.query;
  let { level } = req.query;
  level = Number(level);

  // order의 값에 따라 sort를 하기 위한 key값 준비
  const searchReg = new RegExp(keyword);
  switch (order) {
    case 'recommendation':
      sortBy = 'meta.recommendation';
      break;
    case 'rating':
      sortBy = 'meta.rating';
      break;
  }
  // keyword로만 검색했을 경우
  if (!isDetail) {
    cafes = await Cafe.find({
      name: searchReg,
    }).sort({ [sortBy]: -1 });
  } else {
    // keyword 없이 상세 조건으로만 검색했을 경우
    cafes = await Cafe.find({
      $and: [
        { name: keyword ? searchReg : { $nin: '' } },
        { theme: !theme ? { $nin: '' } : { $in: theme } },
        {
          'meta.level': level ? level : { $nin: '' },
        },
      ],
    }).sort({ [sortBy]: -1 });
  }
  return res.render('cafe/search', { cafes });
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
    theme,
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
