import config from '@/config';
import RefreshResponse from '@/types/Responses/RefreshResponse';
import { getCSRFToken } from './getCSRFToken';
import { cookies } from 'next/headers';
import parseCookie from './parseCookie';

const refreshTokens = async () => {
  const cookieStore = await cookies();

  let csrfToken = await getCSRFToken();

  if (!csrfToken) {
    // fetch csrf token for this session
    const csrfResponse = (await fetch(
      config.AUTH_SERVICE_HOST_URL + '/api/v1/refresh-token',
      {
        method: 'get',
      }
    ).then((r) => r.json())) as { csrfToken: string };

    cookieStore.set('csrfToken', csrfResponse.csrfToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    csrfToken = csrfResponse.csrfToken;
  }

  const response = await fetch(
    config.AUTH_SERVICE_HOST_URL + '/api/v1/refresh-token',
    {
      method: 'post',
      headers: {
        'X-CSRF-Token': csrfToken!,
      },
    }
  );

  if (response.status == 200 || response.status == 201) {
    const resData = (await response.json()) as RefreshResponse;

    const { accessToken } = (await response.json()) as { accessToken: string };
    const refreshCookie = parseCookie(
      'refreshToken',
      response.headers.getSetCookie()
    );

    cookieStore.set('accessToken', accessToken, {
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
    cookieStore.set('refreshToken', refreshCookie.Value, {
      httpOnly: refreshCookie.HttpOnly || true,
      expires: refreshCookie.Expires,
      path: refreshCookie.Path ?? '/',
      sameSite: refreshCookie.SameSite || 'lax',
    });

    if (!resData.success) {
      throw new Error(resData.error);
    } else {
      return resData.data;
    }
  } else {
    throw new Error('Invalid Refresh Token');
  }
};

export default refreshTokens;
