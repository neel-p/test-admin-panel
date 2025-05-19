"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useState, useCallback, useEffect } from "react";
import { Card, Button, Spinner, Checkbox, Label } from "flowbite-react";
// Add other Flowbite components as needed
import OutlineCard from "@/app/components/shared/OutlineCard";
// Example API endpoints
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useToast } from "@/app/components/toast/ToastManager";

const defaultPermissions = {
  client: {
    clientId: [],
    permissions: [{
      isAgent: false,
      isChat: false,
	   isTalentPool: false,
	//  isAdmin: false,
      jobtask: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      documents: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      user: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      collection: {
        create: false,
        read: false,
        update: false,
        delete: false,
      }
    }]
  },
  user: {
    userId: [],
    permissions: [{
      isAgent: false,
      isChat: false,
	   isTalentPool: false,
      jobtask: {
        create: false,
        read: false,
        update: false,
        delete: false,
      }
    }]
  }
};

const permissionGroups = [
  {
    key: "collection",
    label: "Collection",
  },
  {
    key: "documents",
    label: "Document",
  },
  {
    key: "user",
    label: "User",
  },
  {
    key: "jobtask",
    label: "Job/Task",
  },
];

const actions = ["create", "read", "update", "delete"];

const NormalCheckbox = ({ checked, onChange, id, label, disabled = false }) => (
  <div className="flex items-center gap-2 mb-2">
    <Checkbox
      className="checkbox"
      checked={checked}
      onChange={onChange}
      id={id}
      disabled={disabled}
    />
    <Label className="font-medium text-base" htmlFor={id}>
      {label}
    </Label>
  </div>
);

const CheckboxWithCurve = ({ checked, onChange, id, label, disabled = false }) => (
  <div className="relative mb-2">
    <div
      className="corner-box"
    />
    <div className="flex items-center gap-2 relative">
      <Checkbox
        className="checkbox"
        checked={checked}
        onChange={onChange}
        id={id}
        disabled={disabled}
      />
      <Label className="font-medium text-base" htmlFor={id}>
        {label}
      </Label>
    </div>
  </div>
);


const RolePermissionPage = () => {
	const router = useRouter();
	const { handleApiResponse } = useHandleApiResponse();
	const { showToast } = useToast();
	const [permissions, setPermissions] = useState(defaultPermissions);
	const [saving, setSaving] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	
  	const fetchPermission = async () => {
		if (isInitialLoad) {
				setPageLoading(true);
		}
		try {
			const res = await api.post("/permission/getGlobalPemissions");
			console.log("res.data", res.data)
			if (res.data.statusCode === 404) {
				setPermissions(defaultPermissions);
			} else if (!res.data.error) {
				// Flatten modules if present in API response
				const apiPermissions = res?.data?.data;

				function flattenModules(perm) {
					if (!perm || !perm.permissions || !perm.permissions[0]) return perm;
					const p0 = perm.permissions[0];
					if (p0.modules) {
						const { modules, ...rest } = p0;
						return {
							...perm,
							permissions: [{
								...rest,
								...modules
							}]
						};
					}
					return perm;
				}

				const flatClient = flattenModules(apiPermissions.client);
				const flatUser = flattenModules(apiPermissions.user);

				const mergedPermissions = {
					client: {
						...defaultPermissions.client,
						...flatClient,
						permissions: [{
							...defaultPermissions.client.permissions[0],
							...flatClient.permissions[0],
							jobtask: {
								...defaultPermissions.client.permissions[0].jobtask,
								...((flatClient.permissions[0] && flatClient.permissions[0].jobtask) || {})
							},
							documents: {
								...defaultPermissions.client.permissions[0].documents,
								...((flatClient.permissions[0] && flatClient.permissions[0].documents) || {})
							},
							user: {
								...defaultPermissions.client.permissions[0].user,
								...((flatClient.permissions[0] && flatClient.permissions[0].user) || {})
							},
							collection: {
								...defaultPermissions.client.permissions[0].collection,
								...((flatClient.permissions[0] && flatClient.permissions[0].collection) || {})
							}
						}]
					},
					user: {
						...defaultPermissions.user,
						...flatUser,
						permissions: [{
							...defaultPermissions.user.permissions[0],
							...flatUser.permissions[0],
							jobtask: {
								...defaultPermissions.user.permissions[0].jobtask,
								...((flatUser.permissions[0] && flatUser.permissions[0].jobtask) || {})
							}
						}]
					}
				};
				setPermissions(mergedPermissions);
			}
		} catch (error) {
			console.error("Failed to fetch edit data:", error);
			// Set default permissions on error
			setPermissions(defaultPermissions);
		} finally {
			setPageLoading(false);
			setIsInitialLoad(false);
		}
	};

	useEffect(() => {
		fetchPermission();
	}, []);

  // Use useCallback for handlers
  const handleSingleCheckbox = useCallback((key, type) => {
    setPermissions((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        permissions: [{
          ...prev[type].permissions[0],
          [key]: !prev[type].permissions[0][key]
        }]
      }
    }));
  }, []);

  const handleGroupLabelCheckbox = useCallback((groupKey, type) => {
    setPermissions((prev) => {
      if (!prev || !prev[type] || !prev[type].permissions || !prev[type].permissions[0]) {
        return prev;
      }
      const updated = { ...prev };
      const group = updated[type].permissions[0][groupKey];
      if (!group) return updated;
      
      const allSelected = Object.values(group).every(Boolean);
      Object.keys(group).forEach((action) => {
        group[action] = !allSelected;
      });
      return updated;
    });
  }, []);

  const handleCheckbox = useCallback((group, action, type) => {
    setPermissions((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        permissions: [{
          ...prev[type].permissions[0],
          [group]: {
            ...prev[type].permissions[0][group],
            [action]: !prev[type].permissions[0][group][action]
          }
        }]
      }
    }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        body: {
          isAll: true,
          client: {
            ...permissions.client,
            clientId: [],
          },
          user: permissions.user,
        },
      };

      const response = await api.post("/permission/setPemissions", payload);

      // Handle success
      handleApiResponse(response);
      if (
        response?.data?.statusCode === 201 ||
        response?.data?.statusCode === 200
      ) {
		  fetchPermission();
        // router.push("/admin/role-permission");
      }
    } catch (error) {
     	const message =
									error?.response?.data?.message || "Network error";
								showToast(message, "error");
	}
	finally {
								setSaving(false);
							}
      
  };

  // Helper for group label checkbox state
  const isGroupAllSelected = (groupKey, type) => {
    if (!permissions?.[type]?.permissions?.[0]?.[groupKey]) {
      return false;
    }
    const group = permissions[type].permissions[0][groupKey];
    return Object.values(group).every(Boolean);
  };

  return (
	<OutlineCard className="mt-[30px] shadow-none">
    <div className="">
      <h2 className="text-lg font-semibold mb-6">Roles & Permissions [Global]</h2>
      {/* For Clients */}
      <Card className="mb-8 border border-bordergray rounded-xl shadow-none">
        <div className="font-semibold text-base mb-4">For Clients</div>
        <div className="flex flex-col gap-6">
          {/* Single Checkboxes */}
          <div className="space-y-4">
            <NormalCheckbox
              checked={permissions.client.permissions[0].isAgent}
              onChange={() => handleSingleCheckbox("isAgent", "client")}
              id="client-agent-view"
              label="Agent View"
            />
            <NormalCheckbox
              checked={permissions.client.permissions[0].isChat}
              onChange={() => handleSingleCheckbox("isChat", "client")}
              id="client-chat-service"
              label="Chat Service"
            />
			 <NormalCheckbox
              checked={permissions.client.permissions[0].isTalentPool}
              onChange={() => handleSingleCheckbox("isTalentPool", "client")}
              id="client-chat-service"
              label="Talent Pool"
            />
			 {/* <NormalCheckbox
              checked={permissions.client.permissions[0].isAdmin}
              onChange={() => handleSingleCheckbox("isAdmin", "client")}
              id="client-chat-service"
              label="Admin Panel"
            /> */}
          </div>

          {/* Permission Groups */}
          {permissionGroups.map((group) => (
            <div key={group.key} className="relative mb-2">
              <CheckboxWithCurve
                checked={isGroupAllSelected(group.key, "client")}
                onChange={() => handleGroupLabelCheckbox(group.key, "client")}
                id={`client-${group.key}`}
                label={group.label}
              />
              <div className="flex flex-wrap gap-4 sm:gap-6 pl-8 relative">
                {actions.map((action) => (
                  <div key={action} className="flex items-center gap-2 min-w-[80px] sm:min-w-[90px]">
                    <Checkbox
                      className="checkbox"
                      checked={permissions?.client?.permissions?.[0]?.[group?.key]?.[action] ?? false}
                      onChange={() => handleCheckbox(group.key, action, "client")}
                      id={`client-${group.key}-${action}`}
                    />
                    <Label htmlFor={`client-${group.key}-${action}`}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* For Users */}
      <Card className="mb-8 border border-bordergray rounded-xl shadow-none">
        <div className="font-semibold text-base mb-4">For Users</div>
        <div className="flex flex-col gap-6">
          {/* Single Checkboxes */}
          <div className="space-y-4">
            <NormalCheckbox
              checked={permissions.user.permissions[0].isAgent}
              onChange={() => handleSingleCheckbox("isAgent", "user")}
              id="user-agent-view"
              label="Agent View"
            />
            <NormalCheckbox
              checked={permissions.user.permissions[0].isChat}
              onChange={() => handleSingleCheckbox("isChat", "user")}
              id="user-chat-service"
              label="Chat Service"
            />
					 <NormalCheckbox
              checked={permissions.user.permissions[0].isTalentPool}
              onChange={() => handleSingleCheckbox("isTalentPool", "user")}
              id="client-chat-service"
              label="Talent Pool"
            />
			 {/* <NormalCheckbox
              checked={permissions.client.permissions[0].isAdmin}
              onChange={() => handleSingleCheckbox("isAdmin", "user")}
              id="client-chat-service"
              label="Admin Panel"
            /> */}
          </div>

          {/* Permission Groups */}
          {permissionGroups.slice(3, 4).map((group) => (
            <div key={group.key} className="relative mb-2">
              <CheckboxWithCurve
                checked={isGroupAllSelected(group.key, "user")}
                onChange={() => handleGroupLabelCheckbox(group.key, "user")}
                id={`user-${group.key}`}
                label={group.label}
              />
              <div className="flex flex-wrap gap-4 sm:gap-6 pl-8 relative">
                {actions.map((action) => (
                  <div key={action} className="flex items-center gap-2 min-w-[80px] sm:min-w-[90px]">
                    <Checkbox
                      className="checkbox"
                      checked={permissions?.user?.permissions?.[0]?.[group?.key]?.[action] ?? false}
                      onChange={() => handleCheckbox(group.key, action, "user")}
                      id={`user-${group.key}-${action}`}
                    />
                    <Label htmlFor={`user-${group.key}-${action}`}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} color="purple" className="px-6">
          {saving ? <Spinner size="sm" /> : "Save changes"}
        </Button>
      </div>
    </div>
	</OutlineCard>
  );
}

export default RolePermissionPage; 