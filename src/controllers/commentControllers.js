import User from '../models/User';
import Cafe from '../models/Cafe';
import Comment from '../models/Comment';

export const createComment = async (req, res) => {
  const { cafeId } = req.params;
  const { text } = req.body;
  const { loggedIn, loggedUser } = req.session;
  if (!loggedIn) {
    return res.sendStatus(400);
  }
  let comment = await Comment.create({
    text,
    owner: loggedUser._id,
    cafe: cafeId,
  });
  comment = await comment.populate('owner');
  // 방탈출 카페에 등록된 댓글 DB에 저장
  const cafe = await Cafe.findById(cafeId);
  cafe.comments.push(comment);
  await cafe.save();

  // 유저가 등록한 댓글 DB에 저장
  const user = await User.findById(loggedUser._id);
  user.comments.push(comment);
  await user.save();

  res.status(201).json({ comment });
};

export const modifyComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const newText = await Comment.findByIdAndUpdate(
    commentId,
    {
      text,
    },
    { new: true }
  );
  return res.sendStatus(200);
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  await Comment.findByIdAndDelete(commentId);
  return res.sendStatus(200);
};
