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
		const csrfResponse = await fetch(
			config.AUTH_SERVICE_HOST_URL + '/api/v1/csrf-token',
			{
				method: 'get',
			}
		);

		const { csrfToken: newCSRFToken } = (await csrfResponse.json()) as {
			csrfToken: string;
		};
		const xsrfCookie = parseCookie(
			'_csrf',
			csrfResponse.headers.getSetCookie()
		);

		cookieStore.set('_csrf', xsrfCookie.Value, {
			httpOnly: xsrfCookie.HttpOnly || true,
			// expires: undefined, // cookie will expire at end of browser session
			path: xsrfCookie.Path ?? '/',
			sameSite: xsrfCookie.SameSite || 'lax',
		});
		cookieStore.set('csrfToken', newCSRFToken, {
			httpOnly: true,
			// expires: undefined, // cookie will expire at end of browser session
			sameSite: 'lax',
			path: '/',
		});

		csrfToken = newCSRFToken;
	}

	const response = await fetch(
		config.AUTH_SERVICE_HOST_URL + '/api/v1/refresh-token',
		{
			method: 'post',
			headers: {
				'X-CSRF-Token': csrfToken!,
				cookie: `refreshToken=${
					cookieStore.get('refreshToken')?.value
				}; _csrf=${cookieStore.get('_csrf')?.value}`,
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
		throw new Error('Failed to refresh token');
	}
};

export default refreshTokens;
