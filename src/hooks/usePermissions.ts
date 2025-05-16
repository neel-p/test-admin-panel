import { usePermissionStore } from '@/stores/usePermissionStore';
import { ModuleKey } from '@/utils/permissionUtils';
import { getDecryptedData } from "@/utils/secureStorage";
import { useEffect } from 'react';

export const usePermissions = () => {
  const hasPermission = usePermissionStore((state) => state.hasPermission);
  const canAccessModule = usePermissionStore((state) => state.canAccessModule);
  const isAgent = usePermissionStore((state) => state.isAgent);
  const setPermissions = usePermissionStore((state) => state.setPermissions);
  const userData = getDecryptedData("user", "cookie");
  const isAdmin = userData?.role?.toLowerCase() === 'admin';
  const isClient = userData?.role?.toLowerCase() === 'client';

  // Initialize permissions from user data
  useEffect(() => {
    if (userData?.permissions) {
      setPermissions(userData.permissions);
    }
  }, [userData?.permissions, setPermissions]);

  const canCreate = (module: ModuleKey) => isAdmin || hasPermission(module, 'create');
  const canRead = (module: ModuleKey) => isAdmin || hasPermission(module, 'read');
  const canUpdate = (module: ModuleKey) => isAdmin || hasPermission(module, 'update');
  const canDelete = (module: ModuleKey) => isAdmin || hasPermission(module, 'delete');
  const canAccess = (module: ModuleKey) => isAdmin || canAccessModule(module);

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canAccessModule: canAccess,
    isAgent: () => isAdmin || isAgent()
  };
};

export const useNoPermissions = () => {
  const { canCreate, canRead, canUpdate, canDelete } = usePermissions();

  const hasNoPermissions = (module: ModuleKey) => {
    return !canCreate(module) && !canRead(module) && !canUpdate(module) && !canDelete(module);
  };

  return {
    hasNoPermissions
  };
}; 