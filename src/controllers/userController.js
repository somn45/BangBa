import bcrypt from 'bcrypt';

import User from '../models/User';

const JOIN_PAGE = 'user/join';
const LOGIN_PAGE = 'user/login';
const EDIT_PAGE = 'user/edit';

export const getJoin = (req, res) => {
  res.render(JOIN_PAGE);
};

export const postJoin = async (req, res) => {
  const { uid, password, passwordConfirm, username, email, phoneNumber, location, watchlist } =
    req.body;
  const avatarUrl = req.file ? req.file.path : '';
  const uidExists = await User.exists({ uid });
  if (uidExists) {
    return res.status(400).render(JOIN_PAGE, { uidErrorMsg: '이미 존재하는 아이디입니다.' });
  }
  const userExists = await User.exists({ username });
  if (userExists) {
    return res.status(400).render(JOIN_PAGE, { usernameErrorMsg: '이미 존재하는 유저명입니다.' });
  }
  const isSamePwdAndPwdConfirm = Boolean(password === passwordConfirm);
  if (!isSamePwdAndPwdConfirm) {
    return res
      .status(400)
      .render(JOIN_PAGE, { passwordErrorMsg: '비밀번호, 비밀번호 확인란이 일치하지 않습니다.' });
  }
  const emailForm = new RegExp(/\w+@\w+.\w+/);
  const isEmailFormat = emailForm.test(email);
  if (!isEmailFormat && email !== '') {
    return res.status(400).render(JOIN_PAGE, { emailErrorMsg: 'Email format is not correct' });
  }
  await User.create({
    uid,
    password,
    passwordConfirm,
    username,
    email,
    phoneNumber,
    location,
    avatarUrl,
    location,
  });
  res.redirect('/');
};

export const getLogin = (req, res) => {
  res.render(LOGIN_PAGE);
};

export const postLogin = async (req, res) => {
  const { uid, password } = req.body;
  const confirmUid = await User.exists({ uid });
  if (!confirmUid) {
    return res.status(404).render(LOGIN_PAGE, { errorMsg: 'ID가 존재하지 않습니다.' });
  }
  const user = await User.findOne({ uid });
  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    return res.status(404).render(LOGIN_PAGE, { errorMsg: '비밀번호가 일치하지 않습니다.' });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect('/');
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

export const profile = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render('404');
  }
  console.log(user);
  res.render('user/profile');
};

export const getEdit = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render('404');
  }
  res.render(EDIT_PAGE);
};

export const postEdit = async (req, res) => {
  try {
    const { username, email, phoneNumber, location, watchlist } = req.body;
    const oldUser = req.session.user;
    const avatarUrl = oldUser.avatarUrl ? oldUser.avatarUrl : '';
    const isExistsUsername = await User.exists({ username });
    if (isExistsUsername) {
      return res.status(400).render(EDIT_PAGE, {
        usernameErrorMsg: '이미 존재하는 유저명입니다.',
      });
    }
    const emailForm = new RegExp(/\w+@\w+.\w+/);
    const isEmailFormat = emailForm.test(email);
    if (!isEmailFormat && email) {
      return res.status(400).render(EDIT_PAGE, {
        emailErrorMsg: '이메일 형식이 아닙니다. xxx@xxx.xxx 형식이여야 합니다.',
      });
    }
    const newUser = await User.findByIdAndUpdate(
      oldUser._id,
      {
        username,
        email,
        phoneNumber,
        location,
        avatarUrl,
        watchlist,
      },
      { new: true }
    );
    req.session.user = newUser;
    res.redirect(`/users/${oldUser._id}`);
  } catch (err) {
    console.log(err);
  }
};

export const getChangePassword = (req, res) => {
  res.render('user/change-password');
};

export const postChangePassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render('404');
  }
  const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isMatchPassword) {
    return res
      .status(400)
      .render('user/change-password', { oldPasswordErrorMsg: '비밀번호가 맞지 않습니다.' });
  }
  if (oldPassword === newPassword) {
    return res.status(400).render('user/change-password', {
      newPasswordErrorMsg: '이전 비밀번호와 같아 변경할 수 없습니다.',
    });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render('user/change-password', {
      newPasswordErrorMsg: '새로운 비밀번호, 새로운 비밀번호 확인란이 일치하지 않습니다.',
    });
  }
  user.password = newPassword;
  await user.save();
  req.session.destroy();
  res.redirect('/login');
};

export const signout = async (req, res) => {
  const user = req.session.user;
  await User.findByIdAndDelete(user._id);
  req.session.destroy();
  res.redirect('/');
};
