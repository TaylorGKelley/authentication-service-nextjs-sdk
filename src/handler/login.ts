import config from '@/config';
import LoginResponse from '@/types/Responses/LoginResponse';
import type RouteHandler from '@/types/RouteHandler';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const routeId = 'login';

const routeHandler: RouteHandler<LoginResponse> = async (req) => {
  const cookieStore = await cookies();
  cookieStore.set('test', 'test', {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
  });

  const body = req.body;

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
