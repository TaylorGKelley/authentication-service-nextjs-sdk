import { type NextRequest } from 'next/server';
import refresh from './refresh';
import callback from './callback';

const routeMap = {
  [refresh.routeId]: refresh.routeHandler,
  [callback.routeId]: callback.routeHandler,
};

const routeHandler = (
  req: NextRequest,
  context: { params: { authService: string } }
) => {
  const routeId = context.params.authService;

  const routeHandler = routeMap[routeId];

  return routeHandler(req);
};

export function handleAuth() {
  return routeHandler;
}
