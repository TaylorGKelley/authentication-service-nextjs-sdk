'use client';

import type User from '@/types/User';
import React, { useContext, type PropsWithChildren } from 'react';
import authContext from './authContext';

type AuthProviderProps = PropsWithChildren & {
	user: User | null | undefined;
	permissions: string[] | undefined;
};

export const useAuthContext = () => {
	const context = useContext(authContext);

	return context;
};

export const AuthProvider = ({
	user,
	permissions,
	children,
}: AuthProviderProps) => {
	return (
		<authContext.Provider
			value={{ user: user || null, permissions: permissions || [] }}>
			{children}
		</authContext.Provider>
	);
};
