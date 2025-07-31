import config from '@/config';
import User from '@/types/User';

type PermissionResponse = {
  user: User;
  permissions: string[];
};

const fetchPermissions = async () => {
  try {
    const response = await fetch(`${config.SITE_URL}/api/auth/permissions`, {
      method: 'get',
    });

    const data = (await response.json()) as PermissionResponse;

    return data;
  } catch (error) {
    throw error;
  }
};

export default fetchPermissions;
