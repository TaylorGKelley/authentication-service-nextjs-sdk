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

  // const body = req.body;

  const res = NextResponse.json<LoginResponse>({
    success: true,
    data: {
      accessToken: '',
      user: {
        id: 0,
        email: '',
      },
    },
  });

  res.cookies.set('test2', 'testy', {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
  });

  return res;
};

export default { routeId, routeHandler };
