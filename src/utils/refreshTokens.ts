import config from '@/config';

const refreshTokens = async () => {
  const response = await fetch(config.SITE_URL + '/api/auth/refresh', {
    method: 'get',
  });

  if (response.status == 200) {
    return (await response.json()) as { accessToken: string };
  } else {
    throw new Error('Invalid Refresh Token');
  }
};

export default refreshTokens;
