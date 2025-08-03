import config from '@/config';
import { getCSRFToken } from './getCSRFToken';
import { cookies } from 'next/headers';
import parseCookie from './parseCookie';

const refreshTokens = async () => {
	const cookieStore = await cookies();

	let csrfToken = await getCSRFToken();
	let newXSRFToken: string | undefined = undefined;

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
		newXSRFToken = xsrfCookie.Value;
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
		const refreshResponse = (await response.json()) as { accessToken: string };

		const { accessToken } = refreshResponse;
		const refreshCookie = parseCookie(
			'refreshToken',
			response.headers.getSetCookie()
		);

		cookieStore.set('accessToken', accessToken, {
			httpOnly: true,
			expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
			path: '/',
			sameSite: 'lax',
		});
		cookieStore.set('refreshToken', refreshCookie.Value, {
			httpOnly: refreshCookie.HttpOnly || true,
			expires: refreshCookie.Expires,
			path: refreshCookie.Path ?? '/',
			sameSite: refreshCookie.SameSite || 'lax',
		});

		return { accessToken, csrfToken, xsrfToken: newXSRFToken };
	} else {
		throw new Error('Failed to refresh token');
	}
};

export default refreshTokens;
