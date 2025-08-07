import User from './types/User';
import AuthMiddlewareConfig from './types/AuthMiddlewareConfig';
import { withAuth } from './middleware';
import fetchWithAuth from '@/apiClient';
import fetchWithAuthServerSide from '@/apiClient/server';
import { hasPermission } from './utils/hasPermission';
import getToken from './utils/getToken';
import refreshTokens from './utils/refreshTokens';

export {
  withAuth,
  fetchWithAuth,
  fetchWithAuthServerSide,
  hasPermission,
  getToken,
  refreshTokens,
  type AuthMiddlewareConfig,
  type User,
};
