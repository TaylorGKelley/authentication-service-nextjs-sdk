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

type Response<T> = DataResponse<T> | ErrorResponse;
type DataResponse<T> = {
    success: true;
    data: T;
};
type ErrorResponse = {
    success: false;
    message: string;
};
declare function fetchWithAuth<T = any>(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response<T>>;

export { type AuthMiddlewareConfig, type User, fetchWithAuth, handleAuth, withAuth };
