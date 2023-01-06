import fetch from 'node-fetch';

import User from '../models/User';
import { combineUrlAndParams, getTokenData, getUserData } from './userMethod';

// 카카오 로그인
export const startKakaoLogin = (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const urlConfig = {
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: 'https://bangba.site/users/kakao/oauth',
    response_type: 'code',
    state: process.env.KAKAO_STATE,
  };
  const finalUrl = combineUrlAndParams(baseUrl, urlConfig);
  res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const { code } = req.query;
  const baseUrl = 'https://kauth.kakao.com/oauth/token';
  const urlConfig = {
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: 'https://bangba.site/users/kakao/oauth',
    code,
  };
  const finalUrl = combineUrlAndParams(baseUrl, urlConfig);
  const tokenRequest = await getTokenData(
    finalUrl,
    'Content-type',
    'application/x-www-form-urlencoded;charset=utf-8'
  );
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await getUserData(
      'https://kapi.kakao.com/v2/user/me',
      access_token
    );
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
    req.session.loggedUser = user;
  } else {
    return res.redirect('/login');
  }
  return res.redirect('/');
};

// 구글 로그인
export const startGoogleLogin = (req, res) => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const urlConfig = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: 'https://bangba.site/users/google/oauth',
    response_type: 'code',
    scope:
      'https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile',
    state: process.env.GOOGLE_STATE,
    nonce: '2nk4nsink@amKI1NSKm2m6k9D9F9XCMMnksn43$!dfdkm',
  };
  const finalUrl = combineUrlAndParams(baseUrl, urlConfig);
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
    redirect_uri: 'https://bangba.site/users/google/oauth',
  };
  const finalUrl = combineUrlAndParams(baseUrl, urlConfig);
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
      await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const { id, name, email, verified_email, picture } = userRequest;
    let user = await User.findOne({ uid: id });
    if (!user) {
      user = await User.create({
        uid: id,
        password: process.env.GOOGLE_PASSWORD,
        username: name,
        email: verified_email ? email : '',
        avatarUrl: picture ? picture : '',
        isSocialAccount: true,
      });
    }
    req.session.loggedIn = true;
    req.session.loggedUser = user;
  } else {
    return res.redirect('/login');
  }
  return res.redirect('/');
};

// 네이버 로그인
export const startNaverLogin = (req, res) => {
  const baseUrl = 'https://nid.naver.com/oauth2.0/authorize';
  const urlConfig = {
    response_type: 'code',
    client_id: process.env.NAVER_CLIENT_ID,
    redirect_uri: 'https://bangba.site/users/naver/oauth',
    state: process.env.NAVER_STATE,
  };
  const finalUrl = combineUrlAndParams(baseUrl, urlConfig);
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
  const finalUrl = combineUrlAndParams(baseUrl, urlConfig);
  const tokenRequest = await getTokenData(finalUrl);
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await getUserData(
      'https://openapi.naver.com/v1/nid/me',
      access_token
    );
    const {
      response: { id, nickname },
    } = userRequest;
    let user = await User.findOne({ uid: id });
    if (!user) {
      user = await User.create({
        uid: id,
        password: process.env.NAVER_PASSWORD,
        username: nickname,
        isSocialAccount: true,
      });
    }
    req.session.loggedIn = true;
    req.session.loggedUser = user;
  } else {
    return res.redirect('/login');
  }
  res.redirect('/');
};
