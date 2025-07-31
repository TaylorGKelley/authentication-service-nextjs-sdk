import LogoutResponse from '@/types/Responses/LogoutResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'logout';

const routeHandler: RouteHandler<LogoutResponse> = (req) => {
  return NextResponse.json({});
};

export default { routeId, routeHandler };
