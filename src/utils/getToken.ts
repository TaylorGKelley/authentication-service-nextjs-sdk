import { headers, cookies } from 'next/headers';

async function getToken(
	token: 'accessToken' | 'csrfToken' | '_csrfCookie'
): Promise<string> {
	const headerStore = await headers();
	const cookieStore = await cookies();

	let tokenValue: string;
	switch (token) {
		case 'accessToken': {
			const isRefreshed = headerStore.get('x-token-refreshed') === 'true';
			tokenValue = isRefreshed
				? headerStore.get('x-access-token') || ''
				: cookieStore.get('accessToken')?.value || '';
			break;
		}
		case 'csrfToken': {
			const isRefreshed = headerStore.get('x-csrf-refreshed') === 'true';
			tokenValue = isRefreshed
				? headerStore.get('x-csrf-token') || ''
				: cookieStore.get('csrfToken')?.value || '';
			break;
		}
		case '_csrfCookie': {
			const isRefreshed = headerStore.get('x-csrf-refreshed') === 'true';
			tokenValue = isRefreshed
				? headerStore.get('x-xsrf-token') || ''
				: cookieStore.get('_csrf')?.value || '';
			break;
		}
	}

	return tokenValue;
}

export default getToken;
