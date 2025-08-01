import { cache } from 'react';
import fetchWithAuth from '@/apiClient';
import config from '@/config';
import User from '@/types/User';

type PermissionResponse = {
  user: User;
  permissions: string[];
};

const getPermissions = cache(async () => {
  try {
    const response = await fetchWithAuth<PermissionResponse>(
      `${config.AUTH_SERVICE_HOST_URL}/api/v1/user-permissions/${config.AUTH_SERVICE_CONNECTED_SERVICE_ID}`,
      {
        method: 'get',
      }
    );

    if (!response.success) throw new Error(response.message);

    return response.data;
  } catch (error) {
    throw error;
  }
});

export default getPermissions;
