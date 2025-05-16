export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  module?: ModuleKey;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { getDecryptedData } from "@/utils/secureStorage";
import { uniqueId } from "lodash";
import { MODULE_DISPLAY_NAMES, MODULE_ROUTES, ModuleKey } from "@/utils/permissionUtils";

const getSidebarContent = (): MenuItem[] => {
	const userData = getDecryptedData("user", "cookie");
	const permissions = userData?.permissions || [];
	const isAdmin = userData?.role?.toLowerCase() === 'admin';

	// Helper function to check if user has access to a module
	const hasModuleAccess = (module: ModuleKey) => {
		if (isAdmin) return true;
		return permissions.some(permission => 
			permission.modules[module] !== undefined
		);
	};

	// Common menu items that can be reused
	const commonMenuItems = {
		collectionList: {
			name: "Collection List",
			icon: "solar:bill-list-line-duotone",
			id: uniqueId(),
			url: "/client/collection",
			module: "documents" as ModuleKey
		},
		agentList: {
			name: "Agent List",
			icon: "solar:accessibility-linear",
			id: uniqueId(),
			url: "/client/agent",
			module: "isAgent" as ModuleKey
		},
		talentPool: {
			name: "Talent Pool",
			icon: "solar:swimming-broken",
			id: uniqueId(),
			url: "/talent-pool",
			module: "isAgent" as ModuleKey
		},
		jobPosting: {
			name: "Job Posting",
			icon: "solar:card-2-broken",
			id: uniqueId(),
			url: "/user/task",
			module: "jobtask" as ModuleKey
		},
		userAgents: {
			name: "User Agents",
			icon: "solar:shield-user-broken",
			id: uniqueId(),
			url: "/user/agent",
			module: "user" as ModuleKey
		}
	};

	// Admin menu items
	const adminMenuItems = [
		{
			name: "Clients List",
			icon: "solar:shield-user-outline",
			id: uniqueId(),
			url: "/admin"
		},
		{
			name: "User List",
			icon: "solar:users-group-rounded-broken",
			id: uniqueId(),
			url: "/client/user"
		},
		commonMenuItems.collectionList,
		commonMenuItems.agentList,
		commonMenuItems.talentPool,
		{
			name: "Role Permission",
			icon: "solar:settings-linear",
			id: uniqueId(),
			url: "/admin/role-permission"
		}
	];

	switch (userData?.role.toLowerCase()) {
		case "admin":
			return [{
				id: 1,
				name: "Admin",
				items: [{
					heading: "Admin",
					children: adminMenuItems
				}]
			}];

		case "client":
			return [{
				id: 2,
				name: "Client",
				items: [{
					heading: "Client",
					children: [
						{
							name: "User List",
							icon: "solar:users-group-rounded-broken",
							id: uniqueId(),
							url: "/client/user"
						},
						{
							name: "Agent List",
							icon: "solar:accessibility-linear",
							id: uniqueId(),
							url: "/client/agent",
						},
						...Object.values(commonMenuItems).filter(item => hasModuleAccess(item.module))
					]
				}]
			}];

		case "user":
			return [{
				id: 3,
				name: "User",
				items: [{
					heading: "User",
					children: [
						
						...Object.values(commonMenuItems).filter(item => hasModuleAccess(item.module))
					]
				}]
			}];

		default:
			return [];
	}
};

export default getSidebarContent;

