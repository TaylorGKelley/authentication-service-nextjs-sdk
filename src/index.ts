import User from './types/User';
import AuthMiddlewareConfig from './types/AuthMiddlewareConfig';
import { withAuth } from './middleware';
import { handleAuth } from './handler';
import fetchWithAuth from '@/apiClient';

export {
  handleAuth,
  withAuth,
  fetchWithAuth,
  type AuthMiddlewareConfig,
  type User,
};
