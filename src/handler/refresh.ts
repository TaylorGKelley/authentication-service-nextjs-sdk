import config from '@/config';
import RefreshResponse from '@/types/Responses/RefreshResponse';
import type RouteHandler from '@/types/RouteHandler';
import { getCSRFToken } from '@/utils/getCSRFToken';
import { NextResponse } from 'next/server';

const routeId = 'refresh';

const routeHandler: RouteHandler<RefreshResponse> = async (_req) => {
  try {
    const csrfToken = await getCSRFToken();

    const response = await fetch(
      `${config.AUTH_SERVICE_HOST_URL}/api/v1/refresh`,
      {
        method: 'post',
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    const { accessToken } = (await response.json()) as { accessToken: string };
    const refreshToken = response.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith('refreshToken'))
      ?.split(';')[0]
      .split('=')[1]!;

    // Set accessToken and refreshToken cookies
    const result = NextResponse.json<RefreshResponse>({
      success: true,
      data: {
        accessToken: '',
      },
    });

    result.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
      expires: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    result.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
      expires: 15 * 60 * 1000, // 15 minutes
    });

    return result;
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
};

export default { routeId, routeHandler };
