import config from '@/config';
import CallbackResponse from '@/types/Responses/CallbackResponse';
import type RouteHandler from '@/types/RouteHandler';
import { NextResponse } from 'next/server';

const routeId = 'callback';

const routeHandler: RouteHandler<CallbackResponse> = (req) => {
  // get access token from search parameter and refresh token from set cookie headers

  // set tokens as cookies

  return NextResponse.redirect(new URL(config.SITE_URL));
};

export default { routeId, routeHandler };
