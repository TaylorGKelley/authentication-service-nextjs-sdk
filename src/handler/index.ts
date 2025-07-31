import { type NextRequest } from 'next/server';
import refresh from './refresh';
import callback from './callback';

const routeMap = {
  [refresh.routeId]: refresh.routeHandler,
  [callback.routeId]: callback.routeHandler,
};

const routeHandler = async (
  req: NextRequest,
  context: { params: Promise<{ authService: string }> }
) => {
  const { authService: routeId } = await context.params;

  const routeHandler = routeMap[routeId];

  return routeHandler(req);
};

export function handleAuth() {
  return routeHandler;
}
