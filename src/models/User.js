import mongoose, { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSocialAccount: { type: Boolean, default: false },
  username: { type: String, unique: true },
  email: { type: String },
  phoneNumber: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
  watchlist: [{ type: String }],
  registeredCafes: [
    { type: Schema.Types.ObjectId, required: true, ref: 'cafes' },
  ],
  comments: [{ type: Schema.Types.ObjectId, required: true, ref: 'comments' }],
});

userSchema.pre('save', async function () {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 5);
    }
  } catch (err) {
    console.log(err);
  }
});

const User = model('users', userSchema);

export default User;
