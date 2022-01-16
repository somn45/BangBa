import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

import User from '../models/User';

const JOIN_PAGE = 'user/join';
const LOGIN_PAGE = 'user/login';
const EDIT_PAGE = 'user/edit';

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
  const isSamePwdAndPwdConfirm = Boolean(password === passwordConfirm);
  if (!isSamePwdAndPwdConfirm) {
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
    location,
  });
  res.redirect('/');
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
      .render(LOGIN_PAGE, { errorMsg: 'ID가 존재하지 않습니다.' });
  }
  const user = await User.findOne({ uid });

  // 유저의 비밀번호가 옳은지 확인
  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    return res
      .status(404)
      .render(LOGIN_PAGE, { errorMsg: '비밀번호가 일치하지 않습니다.' });
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
    // form의 입력값, 현재 로그인 되어있는 유저 정보 가져오기
    const { username, email, phoneNumber, location, watchlist } = req.body;
    const { file } = req;
    const oldUser = req.session.user;

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
    req.session.user = newUser;
    res.redirect(`/users/${oldUser._id}`);
  } catch (err) {
    console.log(err);
  }
};

export const getChangePassword = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render('404');
  }
  res.render('user/change-password');
};

export const postChangePassword = async (req, res) => {
  // 유저 정보 가져오기
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  const user = req.session.user;

  // 확인을 위해 이전의 비밀번호 매칭
  const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isMatchPassword) {
    return res.status(400).render('user/change-password', {
      oldPasswordErrorMsg: '비밀번호가 맞지 않습니다.',
    });
  }

  // 이전 비밀번호와 새 비밀번호가 다른지 확인
  if (oldPassword === newPassword) {
    return res.status(400).render('user/change-password', {
      newPasswordErrorMsg: '이전 비밀번호와 같아 변경할 수 없습니다.',
    });
  }

  // 새 비밀번호와 새 비밀번호 확인란이 일치하는지 확인
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render('user/change-password', {
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
  const user = req.session.user;
  await User.findByIdAndDelete(user._id);
  req.session.destroy();
  res.redirect('/');
};

// 카카오 로그인
export const startKakaoLogin = (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const urlConfig = {
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: 'http://localhost:4000/users/kakao/oauth',
    response_type: 'code',
    state: process.env.KAKAO_STATE,
  };
  const option = new URLSearchParams(urlConfig).toString();
  const finalUrl = `${baseUrl}?${option}`;
  res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const { code } = req.query;
  const baseUrl = 'https://kauth.kakao.com/oauth/token';
  const urlConfig = {
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: 'http://localhost:4000/users/kakao/oauth',
    code,
  };
  const option = new URLSearchParams(urlConfig).toString();
  const finalUrl = `${baseUrl}?${option}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    if ('msg' in userRequest) {
      return res.redirect('/login');
    }
    const {
      kakao_account: {
        email,
        email_needs_agreement,
        is_email_valid,
        is_email_verified,
        profile: { nickname, profile_image_url, is_default_image },
      },
    } = userRequest;
    let user = await User.findOne({ uid: nickname });
    if (!user) {
      const isEmailAvailable =
        !email_needs_agreement && is_email_valid && is_email_verified;
      user = await User.create({
        uid: nickname,
        password: process.env.KAKAO_PASSWORD,
        isSocialAccount: true,
        username: nickname,
        email: isEmailAvailable ? email : '',
        avatarUrl: is_default_image ? '' : profile_image_url,
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
  } else {
    return res.redirect('/login');
  }
  return res.redirect('/');
};

export const startGoogleLogin = (req, res) => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const urlConfig = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: 'http://localhost:4000/users/google/oauth',
    response_type: 'code',
    scope:
      'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    state: process.env.GOOGLE_STATE,
  };
  const option = new URLSearchParams(urlConfig).toString();
  const finalUrl = `${baseUrl}?${option}`;
  res.redirect(finalUrl);
};

export const finishGoogleLogin = async (req, res) => {
  const { code } = req.query;
  const baseUrl = 'https://www.googleapis.com/oauth2/v4/token';
  const urlConfig = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:4000/users/google/oauth',
  };
  const option = new URLSearchParams(urlConfig).toString();
  const finalUrl = `${baseUrl}?${option}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch('https://www.googleapis.com/drive/v2/files', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    console.log(userRequest);
  } else {
    return res.redirect('/login');
  }
  return res.redirect('/');
};

export const startNaverLogin = (req, res) => {
  const baseUrl = 'https://nid.naver.com/oauth2.0/authorize';
  const urlConfig = {
    response_type: 'code',
    client_id: process.env.NAVER_CLIENT_ID,
    redirect_uri: 'http://localhost:4000/users/naver/oauth',
    state: process.env.NAVER_STATE,
  };
  const option = new URLSearchParams(urlConfig).toString();
  const finalUrl = `${baseUrl}?${option}`;
  res.redirect(finalUrl);
};

export const finishNaverLogin = async (req, res) => {
  const { code } = req.query;
  const baseUrl = 'https://nid.naver.com/oauth2.0/token';
  const urlConfig = {
    grant_type: 'authorization_code',
    client_id: process.env.NAVER_CLIENT_ID,
    client_secret: process.env.NAVER_CLIENT_SECRET,
    code,
    state: process.env.NAVER_STATE,
  };
  const option = new URLSearchParams(urlConfig).toString();
  const finalUrl = `${baseUrl}?${option}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const {
      response: { id, nickname },
    } = userRequest;
    let user = await User.findOne({ uid: id });
    if (!user) {
      user = await User.create({
        uid: id,
        password: process.env.NAVER_PASSWORD,
        isSocialAccount: true,
        username: nickname,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
  } else {
    return res.redirect('/login');
  }
  res.redirect('/');
};
