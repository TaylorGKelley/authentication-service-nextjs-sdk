import config from '@/config';
import RefreshResponse from '@/types/Responses/RefreshResponse';

const refreshTokens = async () => {
  const response = await fetch(config.SITE_URL + '/api/auth/refresh', {
    method: 'get',
  });

  if (response.status == 200 || response.status == 201) {
    const resData = (await response.json()) as RefreshResponse;

    if (!resData.success) {
      throw new Error(resData.error);
    } else {
      return resData.data;
    }
  } else {
    throw new Error('Invalid Refresh Token');
  }
};

export default refreshTokens;
