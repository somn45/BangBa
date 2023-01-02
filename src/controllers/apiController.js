import Cafe from '../models/Cafe';
import User from '../models/User';

export const checkRecommendedUser = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  const { loggedUser } = req.session;
  // 유저가 이미 카페를 추천했을 경우 상태 코드 200 전송
  if (cafe.meta.recommendedUser.indexOf(loggedUser._id) !== -1) {
    return res.sendStatus(200);
  }
  res.sendStatus(202);
};

export const increaseRecommendation = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);

  // 카페의 추천 수를 하나 올리고 추천한 유저 데이터 저장
  cafe.meta.recommendation += 1;

  const { loggedUser } = req.session;

  cafe.meta.recommendedUser.push(loggedUser._id);
  await cafe.save();
  res.sendStatus(200);
};

export const decreaseRecommendation = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  cafe.meta.recommendation -= 1;

  const { loggedUser } = req.session;

  const filter = cafe.meta.recommendedUser.filter((userId) => {
    return String(userId) !== String(loggedUser._id);
  });
  cafe.meta.recommendedUser = filter;
  await cafe.save();
  return res.sendStatus(200);
};

export const addWatchList = async (req, res) => {
  const { themeList } = req.body;
  const { loggedUser } = req.session;
  if (!loggedUser) {
    return res.sendStatus(404);
  }
  const user = await User.findByIdAndUpdate(
    { _id: loggedUser._id },
    {
      watchlist: themeList,
    },
    { new: true }
  );
  req.session.loggedUser = user;
  res.sendStatus(200);
};

export const findLocation = async (req, res) => {
  let message = '';
  const { location } = req.query;
  const cafes = await Cafe.find();
  const results = cafes.filter((cafe) => cafe.location.includes(location));
  if (results.length === 0) {
    message = '찾으시는 지역에 방탈출 카페가 존재하지 않습니다.';
  }
  res.json({ results, message });
};

export const getCafeInfo = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  return res.json({ cafe });
};
