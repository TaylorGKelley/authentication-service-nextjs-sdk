import type { NextRequest, NextResponse } from 'next/server';

type RouteHandler<T> = (
  req: NextRequest
) => NextResponse<T> | Promise<NextResponse<T>>;

export default RouteHandler;
