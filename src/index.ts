import User from './types/User';
import AuthMiddlewareConfig from './types/AuthMiddlewareConfig';
import { withAuth } from './middleware';
import fetchWithAuth from '@/apiClient';
import fetchWithAuthServerSide from '@/apiClient/server';
import { AuthProvider, useAuthContext } from './providers/AuthProvider';

export {
	withAuth,
	fetchWithAuth,
	fetchWithAuthServerSide,
	AuthProvider,
	useAuthContext,
	type AuthMiddlewareConfig,
	type User,
};
