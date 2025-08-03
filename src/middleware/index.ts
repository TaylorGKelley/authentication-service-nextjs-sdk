import config from '@/config';
import type AuthMiddlewareConfig from '@/types/AuthMiddlewareConfig';
import type User from '@/types/User';
import getPermissions from '@/utils/getPermissions';
import { isExpiredToken } from '@/utils/isExpiredToken';
import refreshTokens from '@/utils/refreshTokens';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';
import { NextFetchEvent, NextResponse, type NextRequest } from 'next/server';

const authMiddleware = async (
	req: NextRequest,
	options: AuthMiddlewareConfig,
	onSuccess: ({ user }: { user: User | null }) => Promise<NextMiddlewareResult>
) => {
	try {
		const url = req.nextUrl.clone();

		if (!Object.keys(options.protectedPaths).includes(url.pathname)) {
			return await onSuccess({ user: null });
		}

		// Check if the user is logged in and has valid permissions
		const refreshToken = req.cookies.get('refreshToken')?.value;
		let accessToken = req.cookies.get('accessToken')?.value;

		if (!refreshToken) {
			return NextResponse.redirect(new URL(config.SITE_LOGIN_URL));
		}

		let newAccessToken: string | undefined = undefined;
		let newCSRFToken: string | undefined = undefined;
		let newXSRFToken: string | undefined = undefined;
		if (!accessToken || isExpiredToken(accessToken)) {
			try {
				({
					accessToken: newAccessToken,
					csrfToken: newCSRFToken,
					xsrfToken: newXSRFToken,
				} = await refreshTokens());
			} catch (error) {
				return NextResponse.redirect(new URL(config.SITE_LOGIN_URL));
			}
		}

		const { user, permissions } = await getPermissions();

		if (!user) {
			return NextResponse.redirect(new URL(config.SITE_LOGIN_URL));
		}

		// Check if permission matches pages
		if (
			!options.protectedPaths[url.pathname].some(
				(permission) =>
					permissions.includes(permission) ||
					permission === config.AUTH_PUBLIC_ROUTE_PERMISSION
			)
		) {
			// unauthorized
			return NextResponse.redirect(new URL(config.SITE_UNAUTHORIZED_URL));
		}

		// redirect to login
		const res = await onSuccess({ user });

		if (!newAccessToken) return res;

		const finalResponse = NextResponse.next({
			request: {
				headers: new Headers(req.headers),
			},
		});
		finalResponse.headers.set('x-access-token', newAccessToken);
		finalResponse.headers.set('x-csrf-token', newCSRFToken || '');
		finalResponse.headers.set('x-xsrf-token', newXSRFToken || '');
		finalResponse.headers.set(
			'x-csrf-refreshed',
			String(newXSRFToken !== undefined)
		);
		finalResponse.headers.set('x-token-refreshed', 'true');

		return finalResponse;
	} catch (error) {
		console.error(error);
		return NextResponse.redirect(new URL(config.SITE_LOGIN_URL));
	}
};

export const withAuth = (
	middleware: (
		request: NextRequest & { user: User | null },
		event: NextFetchEvent
	) => NextMiddlewareResult | Promise<NextMiddlewareResult>,
	options: AuthMiddlewareConfig
) => {
	return async (
		...args: [req: NextRequest & { user: User | null }, event: NextFetchEvent]
	) => {
		const req = args[0];
		return await authMiddleware(req, options, async ({ user }) => {
			args[0].user = user;
			return await middleware(...args);
		});
	};
};
