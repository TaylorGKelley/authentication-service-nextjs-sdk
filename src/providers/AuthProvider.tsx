'use client';

import type User from '@/types/User';
import React, {
	createContext,
	useContext,
	type PropsWithChildren,
} from 'react';

type AuthProviderProps = PropsWithChildren & {
	user: User | null;
	permissions: string[];
};

type AuthContext = {
	user: User | null;
	permissions: string[];
};

export const authContext = createContext<AuthContext>({
	user: null,
	permissions: [],
});

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
