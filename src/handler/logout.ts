import fetchWithAuth from '@/apiClient';
import config from '@/config';
import LogoutResponse from '@/types/Responses/LogoutResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'logout';

const routeHandler: RouteHandler<LogoutResponse> = async (_req) => {
  try {
    const response = await fetchWithAuth(
      `${config.AUTH_SERVICE_HOST_URL}/api/v1/logout`,
      {
        method: 'get',
      }
    );

    if (!response.success) {
      throw new Error(response.message);
    }

    const result = NextResponse.json<LogoutResponse>({
      success: true,
      data: undefined,
    });

    result.cookies.delete('accessToken');
    result.cookies.delete('refreshToken');

    return result;
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
};

export default { routeId, routeHandler };
