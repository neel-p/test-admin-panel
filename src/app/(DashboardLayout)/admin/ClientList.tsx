"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { Checkbox, Label, Modal, Tooltip } from "flowbite-react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNoPermissions, usePermissions } from '@/hooks/usePermissions';

import DeleteWarningModal from "@/app/components/shared/DeleteWarningModal";
import { Icon } from "@iconify/react";
import PaginationTable from '@/app/components/react-tables/pagination/page'
import RolePermissionPage from "./role-permission/ModalRolePermission";
import api from "@/utils/axios";
import { debounce } from "lodash";
import { getFormattedPhoneNumber } from "@/utils/commonFUnction";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastManager";
import { useTransition } from "react";
import { useClientStore } from "@/stores/clientStore";

interface ClientDetails {
	companyName?: string;
	description?: string;
	website?: string;
	companyAddress?: string;
	addressLine1: string;
	addressLine2?: string;
	state: string;
	city: string;
	zip: string;
}

interface ClientContacts {
	name?: string;
	mobile?: string;
	emailAddress?: string;
}

interface Client {
	createdAt?: string;
	createdBy?: string | null;
	modifiedBy?: string | null;
	modifiedAt?: string;
	id: number;
	clientDetails?: ClientDetails;
	clientContacts?: ClientContacts;
	isDeleted?: boolean | null;
	actions?: any;
}

interface DeleteModalState {
	isOpen?: boolean  | null;
	data?: any
}

const columnHelper = createColumnHelper<Client>();

const ClientList = () => {
	const { canCreate, canRead, canUpdate, canDelete } = usePermissions();
	const { hasNoPermissions } = useNoPermissions();
	const router = useRouter();
	const { showToast } = useToast();
	const [isPending, startTransition] = useTransition();
	const { handleApiResponse } = useHandleApiResponse();
	const [data, setData] = useState<Client[]>([]);
	const { setClientList } = useClientStore();
	const [total, setTotal] = useState(0);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("id");
	const [pageLoading, setPageLoading] = useState(false);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
	const [showPermissionModal, setShowPermissionModal] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<DeleteModalState>({
		isOpen: false,
		data: null,
	});

	const onCloseDeleteModal =()=>{
		setIsDeleteModalOpen({
			isOpen: false,
			data: null
		})
	}

	const handleDeleteClient = async (ids: any) => {
		try {
			const payload = {
				body: {
					id: ids,
					isDeleted: true,
				},
			};
			const response = await api.post("/client/updateClientProfile", payload);
			handleApiResponse(response);
			if (
				response?.data?.statusCode === 200 ||
				response?.data?.statusCode === 201
			) {
				onCloseDeleteModal();
				fetchUsers();
			}
		} catch (error: any) {
			const message = error?.response?.data?.message || "Network error";
			showToast(message, "error");
		} finally {
		}
	};

	const columns: ColumnDef<Client>[] = useMemo(
		() => [
			columnHelper.accessor("id", {
				id: "select",
				header: () => null,
				cell: ({ row }) => (
					<Checkbox
						checked={selectedClientIds.includes(row.original.id)}
						onChange={() => {
							const id = row.original.id;
							setSelectedClientIds((prev) =>
								prev.includes(id)
									? prev.filter((cid) => cid !== id)
									: [...prev, id]
							);
						}}
						// color="purple"
					/>
				),
				enableSorting: false,
			}) as ColumnDef<Client>,
			columnHelper.accessor("id", {
				id: "id",
				header: () => <Label>Sr No</Label>,
				cell: (info) => (
					<p className="text-sm text-darklink dark:text-bodytext ">
						{pageIndex * pageSize + info.row.index + 1}
					</p>
				),
				enableSorting: false,
			}) as ColumnDef<Client>,
			columnHelper.accessor("clientContacts.name", {
				id: "clientContacts.name",
				header: () => <Label>Client's Name</Label>,
				cell: (info) => (

					<Tooltip content={info.getValue()} placement="top">
							<p
								className="text-darklink dark:text-bodytext text-sm truncate max-w-[200px] cursor-help"
							>
								{info.getValue()}
							</p>
						</Tooltip>

					
				),
				enableSorting: true,
			}) as ColumnDef<Client>,

			columnHelper.accessor("clientDetails.companyName", {
				id: "clientDetails.companyName",
				header: () => <Label>Company Name</Label>,
				cell: (info) => (
					<Tooltip content={info.getValue()} placement="top">
							<p
								className="text-darklink dark:text-bodytext text-sm truncate max-w-[200px] cursor-help"
								
							>
								{info.getValue()}
							</p>
						</Tooltip>
				),
				enableSorting: true,
			}) as ColumnDef<Client>,

			columnHelper.accessor("clientContacts.mobile", {
				id: "clientContacts.mobile",
				header: () => <Label>Mobile Number</Label>,
				cell: (info) => {
					const row = info?.row?.original;		
					const formatted = getFormattedPhoneNumber(row?.clientContacts?.mobile);
					return (
						<p className="text-darklink dark:text-bodytext text-sm">
							{formatted || "-"}
						</p>
					)
				},
				enableSorting: true,
			}) as ColumnDef<Client>,


			columnHelper.accessor("clientDetails.addressLine1", {
				id: "clientDetails.address",
				header: () => <Label>Address</Label>,
				cell: (info) => {
					const row = info.row.original;
					const parts = [
						row.clientDetails?.addressLine1,
						row.clientDetails?.city,
						row.clientDetails?.state,
						row.clientDetails?.zip,
					].filter(Boolean);

					const address = parts.length ? parts.join(", ") : "-";

					return (
						<Tooltip content={address} placement="top">
							<p
								className="text-darklink dark:text-bodytext text-sm truncate max-w-[200px] cursor-help"
							>
								{address}
							</p>
						</Tooltip>
					);
				},
				enableSorting: false,
			}) as ColumnDef<Client>,


			columnHelper.accessor("clientDetails.website", {
				id: "clientDetails.website",
				header: () => <Label>Website</Label>,
				cell: (info) => (
					<a
						href={info.getValue()}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:underline"
					>
						{info.getValue()}
					</a>
				),
				enableSorting: true,
			}) as ColumnDef<Client>,
			columnHelper.accessor("clientContacts.emailAddress", {
				id: "clientContacts.emailAddress",
				header: () => <Label>Email</Label>,
				cell: (info) => (
					<p className="text-darklink dark:text-bodytext text-sm">
						{info.getValue()}
					</p>
				),
				enableSorting: true,
			}) as ColumnDef<Client>,
			columnHelper.accessor("actions", {
				id: "actions",
				cell: ({ row }) => {
					const rowData = row.original; // Get row data once to use in both handlers

					const handleEditClick = () => {
						router.push(`admin/${rowData?.id}`);
						// router.push(`/admin?clientId=${rowData?.id}`, undefined, { shallow: true });
					};

					const handleDeleteClick = () => {
						// handleDeleteClient(rowData?.id);
						setIsDeleteModalOpen({
							isOpen: true,
							data: rowData
						})
					};

					const handleViewClick = () => {
						startTransition(() => {
							router.push(`/admin/profile?id=${rowData?.id}`);
							// router.push(`/admin/profile?id=${rowData?.id}`);
						});
					};
					
					return (
						<div className="flex space-x-4">
							 {canRead('client') && (
								<ActionButton
								onClick={handleViewClick}
								tooltip="View"
								icon="solar:eye-broken"
								/>
							   )}
							{canUpdate('client') && (
								<ActionButton
								onClick={handleEditClick}
								tooltip="Edit"
								icon="solar:pen-new-square-broken"
								/>
							)}
							{canDelete('client') && (
								<ActionButton
								onClick={handleDeleteClick}
								tooltip="Delete"
								icon="solar:trash-bin-minimalistic-outline"
								/>
							)}
						</div>
						);
					},
				header: () => <Label>Action</Label>,
			}),
		],
		[selectedClientIds, pageIndex, pageSize]
	);
	const fetchUsers = useCallback(async () => {
		if (isInitialLoad) {
			setPageLoading(true);
		}
		try {
			const payload = {
				body: {
					page: pageIndex + 1,
					pageSize,
					search,
					sortBy,
					sortOrder,
				},
			};
			const res = await api.post("/admin/getAllClientList", payload);
			if (res.data.statusCode === 404) {
				console.error("No matching clients found");
				setData([]);
				setClientList([]);
				setTotal(0);
			} else if (!res.data.error) {
				const clientData = res?.data?.data;
				setData(clientData);
				//setClientList(clientData);
				setTotal(res?.data?.totalElements);
			}
		} catch (error) {
			console.error("Failed to fetch edit data:", error);
		} finally {
			setPageLoading(false);
			setIsInitialLoad(false);
		}
	}, [pageIndex, pageSize, search, sortBy, sortOrder, isInitialLoad, setClientList]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const debouncedSearch = useCallback(
		debounce((value: string) => {
			setPageIndex(0);
			setSearch(value);
		}, 300),
		[]
	);

	const ActionButton = ({ onClick, tooltip, icon }) => (
		<div className="flex items-center space-x-2 cursor-pointer" onClick={onClick}>
			<Tooltip content={tooltip}>
			<span className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-darklink dark:text-white">
				<Icon icon={icon} height={18} />
			</span>
			</Tooltip>
		</div>
	);
	
	return (
		<>
		{hasNoPermissions('client') ? (
			  <div className="flex items-center justify-center h-[50vh]">
				  <div className="text-center">
					  <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Access</h1>
					  <p className="text-gray-500 dark:text-gray-400">You don't have any permissions to access this module.</p>
				  </div>
			  </div>
		  ) : (
				<PaginationTable
					columns={columns}
					data={data || []}
					total={total}
					pageIndex={pageIndex}
					pageSize={pageSize}
					onPageChange={setPageIndex}
					onSearchChange={debouncedSearch}
					onPageSizeChange={setPageSize}
					onSortChange={(id, order) => {
						setPageIndex(0);
						setSortBy(id);
						setSortOrder(order);
					}}
					title="Clients"
					pageSizeOptions={[10, 20, 30, 40, 50]}
					buttonName={canCreate('client')?  "Add Client": 'no button'}
					buttonLink="/admin/Add-Client"
					isForm={false}
					form={null}
					isLoading={pageLoading}
				/>
		  	)}
				{selectedClientIds.length > 0 && (
					<div
						className="fixed left-1/2 bottom-8 transform -translate-x-1/2 z-50 flex items-center bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2"
						style={{ minWidth: 320 }}
					>
						<span className="mr-4 text-sm">{selectedClientIds.length} clients selected</span>
						<button
							className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
							onClick={() => setShowPermissionModal(true)}
						>
							Set Permission
						</button>
					</div>
				)}
				{showPermissionModal && (
					<Modal
						onClose={() => {
							setShowPermissionModal(false);
							setSelectedClientIds([]);
						}}
						show={showPermissionModal}
						popup			
 
>
    <Modal.Header>Roles & Permissions</Modal.Header>
    <Modal.Body>
      <div className="space-y-6">
        <RolePermissionPage
          clientIds={selectedClientIds}
          isBulk={selectedClientIds.length > 1}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedClientIds([]);
          }}
        />
      </div>
    </Modal.Body>

</Modal>
				)}
		
			<DeleteWarningModal
				isOpen={isDeleteModalOpen.isOpen ?? false}
				onClose={() => onCloseDeleteModal()}
				onConfirm={() => handleDeleteClient(isDeleteModalOpen?.data?.id)}
				title={`Delete Client?`}
				message="Are you sure you want to delete this client? This action cannot be undone."
				confirmButtonText="Yes"
				cancelButtonText="No"
				confirmButtonColor="failure"
      />
		</>
	);
};

export default ClientList;
