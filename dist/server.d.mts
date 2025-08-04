import { U as User } from './User-Dxji2Gyd.mjs';
import { NextMiddlewareResult } from 'next/dist/server/web/types';
import { NextRequest, NextFetchEvent } from 'next/server';

type AuthMiddlewareConfig = {
    protectedPaths: {
        [route: string]: string[];
    };
};

declare const withAuth: (middleware: (request: NextRequest & {
    user: User | null;
}, event: NextFetchEvent) => NextMiddlewareResult | Promise<NextMiddlewareResult>, options: AuthMiddlewareConfig) => (...args: [req: NextRequest & {
    user: User | null;
}, event: NextFetchEvent]) => Promise<NextMiddlewareResult>;

type Response$1<T> = DataResponse$1<T> | ErrorResponse$1;
type DataResponse$1<T> = {
    success: true;
    data: T;
};
type ErrorResponse$1 = {
    success: false;
    message: string;
};
/**
 *
 * @param input The input can be a string, URL, or Request object. Meant to be the URL of the API endpoint.
 * @param init Any request options such as method, headers, body, etc.
 * @template T The type of the response body. Defaults to any.
 * @returns
 */
declare function fetchWithAuth<T = any>(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response$1<T>>;

type Response<T> = DataResponse<T> | ErrorResponse;
type DataResponse<T> = {
    success: true;
    data: T;
};
type ErrorResponse = {
    success: false;
    message: string;
};
/**
 * This fetch is to be used either in middleware or server actions.
 * It auto refreshes the access token if it has expired, which will not work in Server Components.
 *
 * @param input The input can be a string, URL, or Request object. Meant to be the URL of the API endpoint.
 * @param init Any request options such as method, headers, body, etc.
 * @template T The type of the response body. Defaults to any.
 * @returns
 */
declare function fetchWithAuthServerSide<T = any>(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response<T>>;

type PermissionResponse = {
    user: User;
    permissions: string[];
};
declare const getPermissions: () => Promise<PermissionResponse>;

export { type AuthMiddlewareConfig, User, fetchWithAuth, fetchWithAuthServerSide, getPermissions, withAuth };
