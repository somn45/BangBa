import mongoose, { model, Schema } from 'mongoose';
import User from './User';

const cafeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  theme: [{ type: String, required: true }],
  location: { type: String, required: true },
  meta: {
    level: { type: Number, required: true },
    recommendation: { type: Number },
    rating: { type: Number },
  },
  backgroundUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  comments: [{ type: Schema.Types.ObjectId, required: true, ref: 'comments' }],
});

const Cafe = model('cafes', cafeSchema);

export default Cafe;
