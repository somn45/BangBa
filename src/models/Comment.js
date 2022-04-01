import mongoose, { model, Schema } from 'mongoose';

const commentSchema = mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  owner: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  cafe: { type: Schema.Types.ObjectId, required: true, ref: 'cafes' },
});

const Comment = model('comments', commentSchema);

export default Comment;
