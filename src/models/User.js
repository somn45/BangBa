import mongoose, { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  phoneNumber: { type: String },
  location: { type: String },
});

userSchema.pre('save', async function () {
  try {
    this.password = await bcrypt.hash(this.password, 5);
  } catch (err) {
    console.log(err);
  }
});

const User = model('users', userSchema);

export default User;
