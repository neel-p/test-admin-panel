import { create } from 'zustand';

interface ModulePermission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface ModulePermissions {
  jobtask?: ModulePermission;
  documents?: ModulePermission;
  collection?: ModulePermission;
  client?:ModulePermission;
	user?: ModulePermission;
}

interface Permission {
  isAgent: boolean;
  isChat: boolean;
  modules: ModulePermissions;
}

interface PermissionState {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  hasPermission: (module: keyof ModulePermissions, action: keyof ModulePermission) => boolean;
  canAccessModule: (module: keyof ModulePermissions) => boolean;
  isAgent: () => boolean;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  
  setPermissions: (permissions) => set({ permissions }),
  
  hasPermission: (module, action) => {
    const { permissions } = get();
    return permissions.some(permission => 
      permission.modules[module]?.[action] === true
    );
  },
  
  canAccessModule: (module) => {
    const { permissions } = get();
    return permissions.some(permission => 
      permission.modules[module] !== undefined
    );
  },
  
  isAgent: () => {
    const { permissions } = get();
    return permissions.some(permission => permission.isAgent === true);
  }
})); 