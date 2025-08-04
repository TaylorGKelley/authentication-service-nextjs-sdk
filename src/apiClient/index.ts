import getToken from '@/utils/getToken';

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
 *
 * @param input The input can be a string, URL, or Request object. Meant to be the URL of the API endpoint.
 * @param init Any request options such as method, headers, body, etc.
 * @template T The type of the response body. Defaults to any.
 * @returns
 */
export default async function fetchWithAuth<T = any>(
	input: string | URL | globalThis.Request,
	init?: RequestInit
): Promise<Response<T>> {
	try {
		let accessToken = await getToken('accessToken');
		const csrfToken = await getToken('csrfToken');

		const response = await fetch(input, {
			...init,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'X-CSRF-Token': csrfToken,
				cookie: `_csrf=${await getToken('_csrfCookie')};`,
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
