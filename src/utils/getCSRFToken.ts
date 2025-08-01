import config from '@/config';
import CSRFResponse from '@/types/Responses/CSRFResponse';
import { cookies } from 'next/headers';

export const getCSRFToken = async () => {
  try {
    const cookieStore = await cookies();
    let csrfToken = cookieStore.get('csrfToken')?.value;

    if (!csrfToken) {
      const response = await fetch(`${config.SITE_URL}/api/auth/csrf`, {
        method: 'get',
      });

      const body = (await response.json()) as CSRFResponse;

      if (!body.success) throw new Error(body.error);

      csrfToken = body.data.csrfToken;
    }

    return csrfToken;
  } catch (error) {
    return null;
  }
};
