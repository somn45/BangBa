import fetch from 'node-fetch';

export const combineUrlAndParams = (url, paramObj) => {
  const option = new URLSearchParams(paramObj).toString();
  return `${url}?${option}`;
};

export const getTokenData = async (url, headersKey, headersValue) => {
  const jsonData = await (
    await fetch(url, {
      method: 'POST',
      headers: {
        headersKey: headersValue,
      },
    })
  ).json();
  return jsonData;
};

export const getUserData = async (url, access_token) => {
  const userData = await (
    await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
  ).json();
  return userData;
};
