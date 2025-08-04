import getToken from '@/utils/getToken';
import { isExpiredToken } from '@/utils/isExpiredToken';
import refreshTokens from '@/utils/refreshTokens';

export type Response<T> = DataResponse<T> | ErrorResponse;

type DataResponse<T> = {
	success: true;
	data: T;
};

type ErrorResponse = {
	success: false;
	message: string;
};

/**
 * This fetch is to be used either in middleware or server actions.
 * It auto refreshes the access token if it has expired, which will not work in Server Components.
 *
 * @param input The input can be a string, URL, or Request object. Meant to be the URL of the API endpoint.
 * @param init Any request options such as method, headers, body, etc.
 * @template T The type of the response body. Defaults to any.
 * @returns
 */
export default async function fetchWithAuthServerSide<T = any>(
	input: string | URL | globalThis.Request,
	init?: RequestInit
): Promise<Response<T>> {
	try {
		let accessToken = await getToken('accessToken');
		let csrfToken = await getToken('csrfToken');
		let xsrfToken = await getToken('_csrfCookie');

		if (!accessToken || isExpiredToken(accessToken)) {
			const newTokens = await refreshTokens();
			accessToken = newTokens.accessToken;
			csrfToken = newTokens.csrfToken;
			if (newTokens.xsrfToken) {
				xsrfToken = newTokens.xsrfToken;
			}
		}

		const response = await fetch(input, {
			...init,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'X-CSRF-Token': csrfToken,
				cookie: `_csrf=${xsrfToken};`,
				...init?.headers,
			},
		});

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
