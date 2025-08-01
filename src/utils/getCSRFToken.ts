import { cookies } from 'next/headers';

export const getCSRFToken = async () => {
  try {
    const cookieStore = await cookies();
    const csrfToken = cookieStore.get('csrfToken')?.value;

    return csrfToken;
  } catch (error) {
    return null;
  }
};
