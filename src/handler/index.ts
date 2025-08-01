import { type NextRequest } from 'next/server';
import refresh from './refresh';
import callback from './callback';
import logout from './logout';
import initialize from './initialize';
import csrf from './csrf';
import login from './login';
import register from './register';

const routeMap = {
  [refresh.routeId]: refresh.routeHandler,
  [csrf.routeId]: csrf.routeHandler,
  [initialize.routeId]: initialize.routeHandler,
  [callback.routeId]: callback.routeHandler,
  [logout.routeId]: logout.routeHandler,
  [login.routeId]: login.routeHandler,
  [register.routeId]: register.routeHandler,
};

const routeHandler = async (
  req: NextRequest,
  context: { params: Promise<{ authService: string }> }
) => {
  const { authService: routeId } = await context.params;

  const handler = routeMap[routeId];

  return handler(req);
};

export function handleAuth() {
  return routeHandler;
}
