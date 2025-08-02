import { getCSRFToken } from '@/utils/getCSRFToken';
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

		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${accessToken}`,
				'X-CSRF-Token': csrfToken || '',
				cookie: `_csrf=${cookieStore.get('_csrf')?.value};`,
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
