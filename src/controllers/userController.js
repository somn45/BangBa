import bcrypt from 'bcrypt';
import User from '../models/User';

const JOIN_PAGE = 'user/join';
const LOGIN_PAGE = 'user/login';
const EDIT_PAGE = 'user/edit';
const CHANGE_PASSWORD_PAGE = 'user/change-password';
const NOT_FOUND_PAGE = '404';

export const getJoin = (req, res) => {
  res.render(JOIN_PAGE);
};

export const postJoin = async (req, res) => {
  // form의 입력값 받아오기
  const {
    uid,
    password,
    passwordConfirm,
    username,
    email,
    phoneNumber,
    location,
    watchlist,
  } = req.body;
  const avatarUrl = req.file ? req.file.path : '';

  // 중복된 유저 ID인지 확인
  const uidExists = await User.exists({ uid });
  if (uidExists) {
    return res
      .status(400)
      .render(JOIN_PAGE, { uidErrorMsg: '이미 존재하는 아이디입니다.' });
  }

  // 중복된 유저 닉네임인지 확인
  const userExists = await User.exists({ username });
  if (userExists) {
    return res
      .status(400)
      .render(JOIN_PAGE, { usernameErrorMsg: '이미 존재하는 유저명입니다.' });
  }

  // 비밀번호와 비밀번호 확인란이 일치하는지 확인
  if (!(password === passwordConfirm)) {
    return res.status(400).render(JOIN_PAGE, {
      passwordErrorMsg: '비밀번호, 비밀번호 확인란이 일치하지 않습니다.',
    });
  }

  // 이메일 형식(xxx@xxx.xxx)인지 확인
  const emailForm = new RegExp(/\w+@\w+.\w+/);
  const isEmailFormat = emailForm.test(email);
  if (!isEmailFormat && email !== '') {
    return res
      .status(400)
      .render(JOIN_PAGE, { emailErrorMsg: 'Email format is not correct' });
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
  });
  res.redirect('/login');
};

export const getLogin = (req, res) => {
  res.render(LOGIN_PAGE);
};

export const postLogin = async (req, res) => {
  // form의 입력값 받아오기
  const { uid, password } = req.body;

  // 유저의 ID가 존재하는지 확인 후 유저의 정보 받아오기
  const confirmUid = await User.exists({ uid });
  if (!confirmUid) {
    return res
      .status(404)
      .render(LOGIN_PAGE, { uidErrorMsg: 'ID가 존재하지 않습니다.' });
  }
  const user = await User.findOne({ uid });

  // 유저의 비밀번호가 옳은지 확인
  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    return res.status(404).render(LOGIN_PAGE, {
      passwordErrorMsg: '비밀번호가 일치하지 않습니다.',
    });
  }
  req.session.loggedIn = true;
  req.session.loggedUser = user;
  res.redirect('/');
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

export const profile = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId)
    .populate('registeredCafes')
    .populate({
      path: 'comments',
      populate: {
        path: 'cafe',
      },
    });
  if (!user) {
    return res.status(404).render(NOT_FOUND_PAGE);
  }
  res.render('user/profile', { user });
};

export const getEdit = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render(NOT_FOUND_PAGE);
  }
  res.render(EDIT_PAGE, { user });
};

export const postEdit = async (req, res) => {
  try {
    // form의 입력값, 현재 로그인 되어있는 유저 정보 가져오기
    const { username, email, phoneNumber, location, watchlist } = req.body;
    const { file } = req;
    const oldUser = req.session.loggedUser;

    const avatarUrl = file
      ? file.path
      : oldUser.avatarUrl
      ? oldUser.avatarUrl
      : '';

    // 중복된 유저인지 확인
    const isExistsUsername = await User.exists({ username });
    if (isExistsUsername && oldUser.username !== username) {
      return res.status(400).render(EDIT_PAGE, {
        usernameErrorMsg: '이미 존재하는 유저명입니다.',
      });
    }

    // 이메일 형식(xxx@xxx.xxx)인지 확인
    const emailForm = new RegExp(/\w+@\w+.\w+/);
    const isEmailFormat = emailForm.test(email);
    if (!isEmailFormat && email) {
      return res.status(400).render(EDIT_PAGE, {
        emailErrorMsg: '이메일 형식이 아닙니다. xxx@xxx.xxx 형식이여야 합니다.',
      });
    }

    // 유저의 정보 업데이트
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
    req.session.loggedUser = newUser;
    res.redirect(`/users/${oldUser._id}`);
  } catch (err) {
    console.log(err);
  }
};

export const getChangePassword = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render(NOT_FOUND_PAGE);
  }
  res.render(CHANGE_PASSWORD_PAGE);
};

export const postChangePassword = async (req, res) => {
  // 유저 정보 가져오기
  const { userId } = req.params;
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findById(userId);

  // 확인을 위해 이전의 비밀번호 매칭
  const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isMatchPassword) {
    return res.status(400).render(CHANGE_PASSWORD_PAGE, {
      oldPasswordErrorMsg: '비밀번호가 맞지 않습니다.',
    });
  }

  // 이전 비밀번호와 새 비밀번호가 다른지 확인
  if (oldPassword === newPassword) {
    return res.status(400).render(CHANGE_PASSWORD_PAGE, {
      newPasswordErrorMsg: '이전 비밀번호와 같아 변경할 수 없습니다.',
    });
  }

  // 새 비밀번호와 새 비밀번호 확인란이 일치하는지 확인
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render(CHANGE_PASSWORD_PAGE, {
      newPasswordErrorMsg:
        '새로운 비밀번호, 새로운 비밀번호 확인란이 일치하지 않습니다.',
    });
  }
  user.password = newPassword;
  await user.save();
  req.session.destroy();
  res.redirect('/login');
};

export const signout = async (req, res) => {
  const user = req.session.loggedUser;
  await User.findByIdAndDelete({ _id: user._id });
  req.session.destroy();

  res.redirect('/');
};
