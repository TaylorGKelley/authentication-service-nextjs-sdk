import InitializeResponse from '@/types/Responses/InitializeResponse';
import type RouteHandler from '@/types/RouteHandler';
import fetchPermissions from '@/utils/fetchPermissions';
import { NextResponse } from 'next/server';

const routeId = 'initialize';

const routeHandler: RouteHandler<InitializeResponse> = async (req) => {
  // fetch user data from api/checking auth state
  const data = await fetchPermissions();

  return NextResponse.json({
    success: true,
    data,
  });
};

export default { routeId, routeHandler };
