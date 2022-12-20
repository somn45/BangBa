import User from '../models/User';
import Cafe from '../models/Cafe';
import Comment from '../models/Comment';

export const createComment = async (req, res) => {
  const { cafeId } = req.params;
  const { text, score } = req.body;
  const { loggedIn, loggedUser } = req.session;
  if (!loggedIn) {
    return res.sendStatus(400);
  }
  let comment = await Comment.create({
    text,
    score,
    owner: loggedUser._id,
    cafe: cafeId,
  });
  comment = await comment.populate('owner');
  // 방탈출 카페에 등록된 댓글 DB에 저장
  const cafe = await Cafe.findById(cafeId).populate('comments');
  cafe.comments.push(comment);
  const sumOfUserScore = cafe.comments.reduce((sum, currentValue) => {
    return sum + currentValue.score;
  }, 0);
  const cafeScore = (sumOfUserScore / cafe.comments.length).toFixed(1);
  cafe.meta.rating = cafeScore;
  await cafe.save();

  // 유저가 등록한 댓글 DB에 저장
  const user = await User.findById(loggedUser._id);
  user.comments.push(comment);
  await user.save();

  res.status(201).json({ comment });
};

export const modifyComment = async (req, res) => {
  const { commentId } = req.params;
  const { text, score } = req.body;
  const comment = await Comment.findByIdAndUpdate(commentId, {
    text,
    score,
  }).populate('cafe');

  const cafe = await Cafe.findById(comment.cafe._id).populate('comments');
  const sumOfUserScore = cafe.comments.reduce((sum, currentValue) => {
    return sum + currentValue.score;
  }, 0);
  const cafeScore = (sumOfUserScore / cafe.comments.length).toFixed(1);
  cafe.meta.rating = cafeScore;
  await cafe.save();
  return res.sendStatus(200);
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId).populate('cafe');
  const cafe = await Cafe.findById(comment.cafe._id).populate('comments');
  await Comment.findByIdAndDelete(commentId);
  const sumOfUserScore = cafe.comments.reduce((sum, currentValue) => {
    return sum + currentValue.score;
  }, 0);
  const cafeScore = (sumOfUserScore / cafe.comments.length).toFixed(1);
  cafe.meta.rating = cafeScore;
  await cafe.save();
  return res.sendStatus(200);
};
