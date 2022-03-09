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
  cafe.meta.recommendedUser.push(req.session.loggedUser._id);
  await cafe.save();
  res.sendStatus(200);
};

export const decreaseRecommendation = async (req, res) => {
  const { cafeId } = req.params;
  const cafe = await Cafe.findById(cafeId);
  cafe.meta.recommendation -= 1;
  const filter = cafe.meta.recommendedUser.filter((userId) => {
    return String(userId) !== String(req.session.loggedUser._id);
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
  const user = await User.findByIdAndUpdate(req.session.loggedUser._id, {
    watchlist: themeList,
  });
  res.sendStatus(200);
};
