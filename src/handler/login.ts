import config from '@/config';
import LoginResponse from '@/types/Responses/LoginResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'login';

const routeHandler: RouteHandler<LoginResponse> = (req) => {
  return NextResponse.json({
    success: true,
    data: {
      accessToken: '',
      user: {
        id: 0,
        email: '',
      },
    },
  });
};

export default { routeId, routeHandler };
