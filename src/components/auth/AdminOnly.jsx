import { useAuthorization } from '../../hooks/useAuthorization';

export default function AdminOnly({
  children,
  fallback = null,
  permission,
}) {
  const { isTenantAdmin, hasPermission } = useAuthorization();

  if (!isTenantAdmin) return fallback;
  if (permission && !hasPermission(permission)) return fallback;

  return children;
}
