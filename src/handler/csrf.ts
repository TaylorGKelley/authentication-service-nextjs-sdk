import config from '@/config';
import CSRFResponse from '@/types/Responses/CSRFResponse';
import RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'csrf';

const routeHandler: RouteHandler<CSRFResponse> = async (_req) => {
  try {
    const response = await fetch(
      `${config.AUTH_SERVICE_HOST_URL}/api/v1/csrf-token`,
      {
        method: 'get',
      }
    );

    if (response.status != 200) {
      throw new Error(response.statusText);
    }

    const data = (await response.json()) as { csrfToken: string };

    // set tokens as cookies
    const nextResponse = NextResponse.json<CSRFResponse>({
      success: true,
      data: {
        csrfToken: data.csrfToken,
      },
    });

    nextResponse.cookies.set('csrfToken', data.csrfToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    const csrfSessionKey = response.headers
      .getSetCookie()
      .find((val) => val.startsWith('_csrf'))
      ?.split(';')[0]
      .split('=')[1]!;
    nextResponse.cookies.set('_csrf', csrfSessionKey, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });

    return nextResponse;
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
};

export default { routeId, routeHandler };
