import { NextMiddlewareResult } from 'next/dist/server/web/types';
import * as next_server from 'next/server';
import { NextRequest, NextFetchEvent } from 'next/server';

type User = {
    id: number;
    email: string;
};

type AuthMiddlewareConfig = {
    protectedPaths: {
        [route: string]: string[];
    };
};

declare const withAuth: (middleware: (request: NextRequest & {
    user: User | null;
}, event: NextFetchEvent) => NextMiddlewareResult | Promise<NextMiddlewareResult>, options: AuthMiddlewareConfig) => (...args: [req: NextRequest & {
    user: User | null;
}, event: NextFetchEvent]) => Promise<void>;

declare function handleAuth(): (req: NextRequest, context: {
    params: Promise<{
        authService: string;
    }>;
}) => Promise<next_server.NextResponse<unknown>>;

export { type AuthMiddlewareConfig, type User, handleAuth, withAuth };
