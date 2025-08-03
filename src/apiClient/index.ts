import { getCSRFToken } from '@/utils/getCSRFToken';
import getToken from '@/utils/getToken';
import { cookies, headers } from 'next/headers';

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
		let accessToken = await getToken('accessToken');
		const csrfToken = await getToken('csrfToken');

		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${accessToken}`,
				'X-CSRF-Token': csrfToken,
				cookie: `_csrf=${await getToken('_csrfCookie')};`,
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
