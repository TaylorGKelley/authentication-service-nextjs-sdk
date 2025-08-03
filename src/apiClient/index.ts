import { getCSRFToken } from '@/utils/getCSRFToken';
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
		const headerStore = await headers();
		const isRefreshed = headerStore.get('x-token-refreshed') === 'true';
		const isCSRFRefreshed = headerStore.get('x-csrf-refreshed') === 'true';

		const cookieStore = await cookies();
		let accessToken = isRefreshed
			? headerStore.get('x-access-token')!
			: cookieStore.get('accessToken')?.value;
		const csrfToken = isCSRFRefreshed
			? headerStore.get('x-csrf-token')
			: await getCSRFToken();

		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${accessToken}`,
				'X-CSRF-Token': csrfToken || '',
				cookie: `_csrf=${
					isCSRFRefreshed
						? headerStore.get('x-xsrf-token')
						: cookieStore.get('_csrf')?.value
				};`,
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
