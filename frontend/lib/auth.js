import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const setTokens = (access, refresh) => {
  Cookies.set('access_token', access, { expires: 1/24, path: '/' }); // 1 hour
  Cookies.set('refresh_token', refresh, { expires: 3, path: '/' }); // 3 days
};

export const clearTokens = () => {
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
};

export const getAccessToken = () => {
  return Cookies.get('access_token');
};

export const getRefreshToken = () => {
  return Cookies.get('refresh_token');
};

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
