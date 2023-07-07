import { TIMEOUT_SEC } from './config';

export const AJAX = async function (url, uploadData = undefined) {
  const fetchPro = uploadData
    ? fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      })
    : fetch(url);
  try {
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const timeout = function (s, throwErr = true) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (throwErr)
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      resolve();
    }, s * 1000);
  });
};
