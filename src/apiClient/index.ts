import { getCSRFToken } from '@/utils/getCSRFToken';
import { isExpiredToken } from '@/utils/isExpiredToken';
import refreshTokens from '@/utils/refreshTokens';
import { cookies } from 'next/headers';

export type Response<T> = DataResponse<T> | ErrorResponse;

type DataResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
};

export default async function fetchWithAuth<T = any>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<Response<T>> {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('accessToken')?.value;

    const csrfToken = await getCSRFToken();

    let response: globalThis.Response | undefined = undefined;
    if (accessToken && isExpiredToken(accessToken)) {
      response = await fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${accessToken}`,
          'X-CSRF-Token': csrfToken || '',
        },
      });
    }

    if (response && response.status >= 200 && response.status < 300) {
      const data = (await response.json()) as T;
      return { success: true, data };
    }

    if (!accessToken || !response || response.status === 401) {
      accessToken = (await refreshTokens()).accessToken;
    }

    response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
        'X-CSRF-Token': csrfToken || '',
      },
    });

    if (response.status > 200 && response.status > 300) {
      throw new Error(response.statusText);
    }

    const data = (await response.json()) as T;

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}
