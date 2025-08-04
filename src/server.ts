import User from './types/User';
import AuthMiddlewareConfig from './types/AuthMiddlewareConfig';
import { withAuth } from './middleware';
import fetchWithAuth from '@/apiClient';
import fetchWithAuthServerSide from '@/apiClient/server';
import { hasPermission } from './utils/hasPermission';

export {
	withAuth,
	fetchWithAuth,
	fetchWithAuthServerSide,
	hasPermission,
	type AuthMiddlewareConfig,
	type User,
};
