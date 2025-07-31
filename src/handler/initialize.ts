import InitializeResponse from '@/types/Responses/InitializeResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'initialize';

const routeHandler: RouteHandler<InitializeResponse> = (req) => {
  // fetch user data from api/checking auth state

  // return user object

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
