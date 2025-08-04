import config from '@/config';
import getPermissions from './getPermissions';

export async function hasPermission(permissions: string[]): Promise<boolean> {
	const { permissions: userPermissions } = await getPermissions();

	return permissions.some(
		(permission) =>
			userPermissions.includes(permission) ||
			permission === config.AUTH_PUBLIC_ROUTE_PERMISSION
	);
}
