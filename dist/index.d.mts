import * as next_server from 'next/server';
import { NextMiddleware, NextRequest, NextFetchEvent } from 'next/server';

type User = {
    id: number;
    email: string;
};

type AuthMiddlewareConfig = {
    protectedPaths: {
        [route: string]: string[];
    };
};

declare const withAuth: (middleware: NextMiddleware, options: AuthMiddlewareConfig) => (...args: [req: NextRequest & {
    user: User | null;
}, event: NextFetchEvent]) => Promise<void>;

declare function handleAuth(): (req: NextRequest, context: {
    params: {
        authService: string;
    };
}) => next_server.NextResponse<string> | Promise<next_server.NextResponse<string>>;

export { type AuthMiddlewareConfig, type User, handleAuth, withAuth };
