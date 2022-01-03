import bcrypt from 'bcrypt';
import User from '../models/User';

export const getJoin = (req, res) => {
  res.render('user/join');
};

export const postJoin = async (req, res) => {
  const { uid, password, passwordConfirm, username, email, phoneNumber, location } = req.body;
  const uidExists = await User.exists({ uid });
  if (uidExists) {
    return res.status(400).render('user/join', { uidErrorMsg: 'User Id already exists' });
  }
  const userExists = await User.exists({ username });
  if (userExists) {
    return res.status(400).render('user/join', { usernameErrorMsg: 'Username already exists' });
  }
  const isSamePwdAndPwdConfirm = Boolean(password === passwordConfirm);
  if (!isSamePwdAndPwdConfirm) {
    return res.status(400).render('user/join', { passwordErrorMsg: 'password doesnt match' });
  }
  const emailForm = new RegExp(/\w+@\w+.\w+/);
  const isEmailFormat = emailForm.test(email);
  if (!isEmailFormat && email !== '') {
    return res.status(400).render('user/join', { emailErrorMsg: 'Email format is not correct' });
  }
  const createdUser = await User.create({
    uid,
    password,
    passwordConfirm,
    username,
    email,
    phoneNumber,
    location,
  });
  res.redirect('/');
};

export const getLogin = (req, res) => {
  res.render('user/login');
};

export const postLogin = async (req, res) => {
  const { uid, password } = req.body;
  const confirmUid = await User.exists({ uid });
  if (!confirmUid) {
    return res.status(404).render('user/login', { errorMsg: 'ID가 존재하지 않습니다.' });
  }
  const user = await User.findOne({ uid });
  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    return res.status(404).render('user/login', { errorMsg: '비밀번호가 일치하지 않습니다.' });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect('/');
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

export const profile = (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.render('home');
  }
  res.render('user/profile');
};

export const getEdit = async (req, res) => {
  res.render('user/edit');
};

export const postEdit = async (req, res) => {
  try {
    const oldUser = req.session.user;
    const { uid, username, email, phoneNumber, location } = req.body;
    const uidExists = await User.exists({ uid });
    if (uidExists && oldUser.uid !== uid) {
      return res.status(400).render('user/edit', { uidErrorMsg: '아이디 중복' });
    }
    const emailForm = new RegExp(/\w+@\w+.\w+/);
    const isEmailFormat = emailForm.test(email);
    if (!isEmailFormat && email !== '') {
      return res.status(400).render('user/edit', { emailErrorMsg: 'Email format is not correct' });
    }
    const newUser = await User.findByIdAndUpdate(
      oldUser._id,
      {
        uid,
        username,
        email,
        phoneNumber,
        location,
      },
      { new: true }
    );
    req.session.user = newUser;
    res.redirect(`/users/${oldUser._id}`);
  } catch (err) {
    console.log(err);
  }
};

export const signout = async (req, res) => {
  const user = req.session.user;
  await User.findByIdAndDelete(user._id);
  req.session.destroy();
  res.redirect('/');
};
