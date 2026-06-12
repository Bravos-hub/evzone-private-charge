import { useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { isTenantAdminOrOwner } from '../utils/roles';

export function useAuthorization() {
  const { user } = useAuth();

  const isTenantAdmin = useMemo(() => isTenantAdminOrOwner(user), [user]);

  const hasPermission = useCallback(
    (permission) => Boolean(user?.permissions?.includes(permission)),
    [user],
  );

  return {
    isTenantAdmin,
    isOwner: user?.canonicalRole === 'TENANT_OWNER',
    hasPermission,
    canReadAnalytics:
      isTenantAdmin && hasPermission('tenant.dashboard.read'),
    canReadPrivateReports:
      isTenantAdmin && hasPermission('private_charging.reports.read'),
    canReadDiagnostics:
      isTenantAdmin && hasPermission('maintenance.diagnostics.read'),
    canUpdateFirmware:
      isTenantAdmin && hasPermission('charge_points.firmware.update'),
    canReadAccessRules:
      isTenantAdmin && hasPermission('private_charging.access.read'),
    canWriteAccessRules:
      isTenantAdmin && hasPermission('private_charging.access.write'),
    canReadTariffs:
      isTenantAdmin && hasPermission('private_charging.tariffs.read'),
    canWriteTariffs:
      isTenantAdmin && hasPermission('private_charging.tariffs.write'),
    canUpdateStationVisibility:
      isTenantAdmin &&
      (hasPermission('station.visibility.update') ||
        hasPermission('station.private_mode.update')),
  };
}
