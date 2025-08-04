import { U as User } from './User-Dxji2Gyd.js';
import React, { PropsWithChildren } from 'react';

type AuthContext = {
    user: User | null;
    permissions: string[];
};

type AuthProviderProps = PropsWithChildren & {
    user: User | null | undefined;
    permissions: string[] | undefined;
};
declare const useAuthContext: () => AuthContext;
declare const AuthProvider: ({ user, permissions, children, }: AuthProviderProps) => React.JSX.Element;

export { AuthProvider, useAuthContext };
