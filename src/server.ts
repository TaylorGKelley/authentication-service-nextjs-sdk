import User from './types/User';
import AuthMiddlewareConfig from './types/AuthMiddlewareConfig';
import { withAuth } from './middleware';
import fetchWithAuth from '@/apiClient';
import fetchWithAuthServerSide from '@/apiClient/server';

export {
	withAuth,
	fetchWithAuth,
	fetchWithAuthServerSide,
	type AuthMiddlewareConfig,
	type User,
};
