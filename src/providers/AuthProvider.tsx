'use client';

import type User from '@/types/User';
import React, { useContext, type PropsWithChildren } from 'react';
import authContext from './authContext';

type AuthProviderProps = PropsWithChildren & {
	user: User | null;
	permissions: string[];
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
		<authContext.Provider value={{ user, permissions }}>
			{children}
		</authContext.Provider>
	);
};
