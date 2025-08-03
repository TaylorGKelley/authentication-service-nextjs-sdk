'use client';

import type User from '@/types/User';
import React from 'react';

type AuthContext = {
	user: User | null;
	permissions: string[];
};

export const authContext = React.createContext<AuthContext>({
	user: null,
	permissions: [],
});

export { authContext as default, type AuthContext };
