"use client";

import { useState, useCallback } from "react";
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
      className="absolute"
      style={{
        left: 10,
        top: 24,
        width: 24,
        height: 20,
        borderLeft: "2px solid #d1d5db",
        borderBottom: "2px solid #d1d5db",
        borderBottomLeftRadius: 16,
        zIndex: 0,
      }}
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

//   useEffect(() => {
//     // Fetch permissions from API
//     fetch(GET_PERMISSIONS_API)
//       .then((res) => res.json())
//       .then((data) => {
//         setPermissions(data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

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
        router.push("/admin/role-permission");
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
    <div className="p-4 sm:p-6">
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