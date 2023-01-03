import Cafe from '../models/Cafe';
import User from '../models/User';
import validateCafeData from '../utils/validateCafeData';

const REGISTER_PAGE = 'cafe/register';
const NOT_FOUND_PAGE = '404';

export const home = async (req, res) => {
  const cafes = await Cafe.find();
  let interestedCafes = [];
  const { loggedUser } = req.session;
  if (!loggedUser) {
    return res.status(200).render('home', { cafes });
  }
  const { watchlist } = loggedUser;
  for (let theme of watchlist) {
    let interestedCafeCount = 0;
    const interestedCafe = await Cafe.find({
      theme,
    })
      .sort({ 'meta.rating': -1 })
      .limit(6);
    interestedCafes[interestedCafeCount] = [theme, ...interestedCafe];
    interestedCafeCount += 1;
  }
  res.status(200).render('home', { interestedCafes });
};

export const getRegister = (req, res) => {
  res.status(200).render(REGISTER_PAGE);
};

export const postRegister = async (req, res) => {
  // form의 입력값 받아오기
  const { name, description, location, theme, level } = req.body;
  const { file } = req;
  const imageUrl = file ? file.location : '';
  const validateMessage = validateCafeData({ location, theme, level });
  if (validateMessage !== 'ok')
    return res.status(400).render(REGISTER_PAGE, validateMessage);

  const user = req.session.loggedUser;
  const cafe = await Cafe.create({
    name,
    description,
    location,
    theme,
    meta: {
      level,
    },
    imageUrl,
    owner: user._id,
  });
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
  if (!cafe) {
    return res.status(404).render(NOT_FOUND_PAGE);
  }

  // 카페의 댓글 불러오기
  const comments = cafe.comments;
  res
    .status(200)
    .render('cafe/detail', { cafe, comments: comments ? comments : '' });
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
  return res.status(200).render('cafe/search', { cafes });
};

export const searchMap = async (req, res) => {
  res.status(200).render('cafe/search-map');
};

export const getEdit = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  if (!cafe) {
    return res.status(404).render(NOT_FOUND_PAGE);
  }
  res.status(200).render('cafe/edit', { cafe });
};

export const postEdit = async (req, res) => {
  // form의 입력값 받아오기
  const { cafeId } = req.params;
  const { name, description, location, theme, level } = req.body;
  const { file } = req;
  let { imageUrl } = await Cafe.findById(cafeId);
  imageUrl = file ? file.path : imageUrl ? imageUrl : '';

  const validateMessage = validateCafeData({ location, theme, level });
  if (validateMessage !== 'ok')
    return res.status(400).render(REGISTER_PAGE, validateMessage);

  await Cafe.findByIdAndUpdate(cafeId, {
    name,
    description,
    location,
    theme,
    meta: {
      level,
    },
    imageUrl,
  });
  res.redirect(`/cafes/${cafeId}`);
};

export const deleteCafe = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  const comments = await Cafe.findById(cafeId).populate('comments');
  if (!cafe) {
    return res.status(404).render(NOT_FOUND_PAGE);
  }
  await Cafe.findByIdAndUpdate(
    cafeId,
    {
      comments: [],
    },
    { new: true }
  );
  await Cafe.findByIdAndDelete(cafeId);
  res.redirect('/');
};
