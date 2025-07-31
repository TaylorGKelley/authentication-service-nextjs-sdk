import { URL } from 'node:url';
import config from '@/config';
import type AuthMiddlewareConfig from '@/types/AuthMiddlewareConfig';
import type User from '@/types/User';
import fetchPermissions from '@/utils/fetchPermissions';
import { isExpiredToken } from '@/utils/isExpiredToken';
import refreshTokens from '@/utils/refreshTokens';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';

const authMiddleware = async (
  req: NextRequest,
  options: AuthMiddlewareConfig,
  onSuccess: ({ user }: { user: User | null }) => Promise<NextMiddlewareResult>
) => {
  try {
    const url = req.nextUrl.clone();

    if (Object.keys(options.protectedPaths).includes(url.pathname)) {
      return await onSuccess({ user: null });
    }

    // Check if the user is logged in and has valid permissions
    const refreshToken = req.cookies.get('refreshToken')?.value;
    let accessToken = req.cookies.get('accessToken')?.value;

    if (!refreshToken) {
      return NextResponse.redirect(new URL(config.SITE_LOGIN_URL));
    }

    if (accessToken && isExpiredToken(accessToken)) {
      // refresh token
      accessToken = (await refreshTokens()).accessToken;
    }

    const { user, permissions } = await fetchPermissions();

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
    return await onSuccess({ user });
  } catch (error) {
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
    await authMiddleware(req, options, async ({ user }) => {
      args[0].user = user;
      return await middleware(...args);
    });
  };
};
