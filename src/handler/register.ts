import config from '@/config';
import RegisterResponse from '@/types/Responses/RegisterResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'register';

const routeHandler: RouteHandler<RegisterResponse> = (req) => {
  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: 0,
        email: '',
      },
    },
  });
};

export default { routeId, routeHandler };
