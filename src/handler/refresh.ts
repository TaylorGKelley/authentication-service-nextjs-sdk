import RefreshResponse from '@/types/Responses/RefreshResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'refresh';

const routeHandler: RouteHandler<RefreshResponse> = (req) => {
  // refresh token and set new tokens in cookies

  return NextResponse.json({ success: true, data: {} });
};

export default { routeId, routeHandler };
