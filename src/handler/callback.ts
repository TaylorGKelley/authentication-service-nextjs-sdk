import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'callback';

const routeHandler: RouteHandler<string> = (req) => {
  return new NextResponse('');
};

export default { routeId, routeHandler };
