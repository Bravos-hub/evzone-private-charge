export const TENANT_ADMIN_CANONICAL_ROLES = [
  'TENANT_OWNER',
  'TENANT_ADMIN',
  'PLATFORM_SUPER_ADMIN',
];

export function isTenantAdminOrOwner(user) {
  if (!user) return false;
  if (TENANT_ADMIN_CANONICAL_ROLES.includes(user.canonicalRole)) return true;
  // Fallback: active membership role if canonicalRole is missing
  if (Array.isArray(user.memberships)) {
    return user.memberships.some((m) =>
      TENANT_ADMIN_CANONICAL_ROLES.includes(
        m.canonicalRole || m.canonicalRoleKey,
      ),
    );
  }
  return false;
}
