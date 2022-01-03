import mongoose, { model, Schema } from 'mongoose';

const cafeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  theme: [{ type: String, required: true }],
  location: { type: String, required: true },
  meta: {
    level: { type: Number, required: true },
    rating: { type: Number },
  },
});

const Cafe = model('cafes', cafeSchema);

export default Cafe;
