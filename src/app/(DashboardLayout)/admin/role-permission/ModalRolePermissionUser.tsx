"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useState, useCallback } from "react";
import { Card, Button, Spinner, Checkbox, Label } from "flowbite-react";
// Add other Flowbite components as needed
import OutlineCard from "@/app/components/shared/OutlineCard";
// Example API endpoints
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useToast } from "@/app/components/toast/ToastManager";
import { useClientStore } from "@/stores/clientStore";
const defaultPermissions = {
  client: {
    clientId: [],
    permissions: [{
      isAgent: false,
      isChat: false,
	   isTalentPool: false,
      collection: {
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
      jobtask: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
    }]
  },
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

interface RolePermissionPageProps {
  clientIds?: number[];
  isBulk?: boolean;
  onClose?: () => void;
   initialPermissions?: any;
   fetchUsers?: () => void;
   userIds?: any
}

export default function ModalRolePermissionUser({ 
	clientIds = [], 	 	
	isBulk = false, 
	onClose, 
	initialPermissions = null,
	fetchUsers,
	userIds

 }: RolePermissionPageProps) {
	const router = useRouter();
	const { getClientId } = useClientStore();
	const { handleApiResponse } = useHandleApiResponse();
	  const { showToast } = useToast();
 		const [permissions, setPermissions] = useState(() => {
		if (initialPermissions && !isBulk) {
			// Transform the permissions structure to match our format
			return {
				client: {
					clientId:[getClientId()],
					permissions: [{
						isAgent: initialPermissions[0]?.isAgent || false,
						isChat: initialPermissions[0]?.isChat || false,
						isTalentPool:initialPermissions[0]?.isTalentPool || false,
						collection: initialPermissions[0]?.modules?.collection || {
							create: false,
							read: false,
							update: false,
							delete: false,
						},
						documents: initialPermissions[0]?.modules?.documents || {
							create: false,
							read: false,
							update: false,
							delete: false,
						},
						user: initialPermissions[0]?.modules?.user || {
							create: false,
							read: false,
							update: false,
							delete: false,
						},
						jobtask: initialPermissions[0]?.modules?.jobtask || {
							create: false,
							read: false,
							update: false,
							delete: false,
						},
					}]
				}
			};
		}
		return {
			client: {
				clientId: [getClientId()],
				permissions: defaultPermissions.client.permissions,
			},
		};
	});
  const [saving, setSaving] = useState(false);


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
			isAll: !userIds.length,
			user: {
				...permissions.client,
				userId: userIds,
			},
			},
		};
		const response = await api.post("/permission/setPemissions", payload);
		// Handle success
			handleApiResponse(response);
			if (fetchUsers) fetchUsers();
			if (onClose) onClose();
    	} 
		catch (error) {
     		const message = error?.response?.data?.message || "Network error";
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
    <div className="">
      {/* For Clients */}
      <Card className="mb-8 border border-bordergray rounded-xl shadow-none">
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
               id="client-isTalentPool-service"
              label="Talent Pool"
            />
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
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} color="purple" className="px-6">
          {saving ? <Spinner size="sm" /> : "Save changes"}
        </Button>
      </div>
    </div>
  );
} 