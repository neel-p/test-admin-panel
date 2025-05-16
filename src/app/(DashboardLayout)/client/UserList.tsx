"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import {Checkbox, Label, Modal, Tooltip} from "flowbite-react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNoPermissions, usePermissions } from '@/hooks/usePermissions';

import DeleteWarningModal from "@/app/components/shared/DeleteWarningModal";
import { Icon } from "@iconify/react";
import ModalRolePermissionUser from "../admin/role-permission/ModalRolePermissionUser";
import PaginationTable from '@/app/components/react-tables/pagination/page'
import api from "@/utils/axios";
import { useClientStore } from "@/stores/clientStore";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastManager";

interface Client {
  createdAt?: string;
  createdBy?: string | null;
  modifiedBy?: string | null;
  modifiedAt?: string;
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobile: string | number;
  designation: string;
  isDeleted?: boolean | null;
  actions?: any;
}
const columnHelper = createColumnHelper<Client>();
interface DeleteModalState {
	isOpen?: boolean  | null;
	data?: any
}

const UserList = () => {
	const { canCreate, canRead, canUpdate, canDelete } = usePermissions();
	 const { hasNoPermissions } = useNoPermissions();
  const { getClientId } = useClientStore();
  const router = useRouter();
  const { showToast } = useToast();
  const { handleApiResponse } = useHandleApiResponse();
  const [data, setData] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
	const [selectedClientPermission, setSelectedClientPermission] = useState<number[]>([]);
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

  const handleDeleteClientUser = async (id: any) => {
    try {
      const payload = {
        body: {
         id: parseInt(id),
          isDeleted: true,
        },
      };
      const response = await api.post("/user/updateUserProfile", payload);
      handleApiResponse(response);
      if (
        response?.data?.statusCode === 200 ||
        response?.data?.statusCode === 201
      ) {
		onCloseDeleteModal()
        fetchUsers();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Network error";
      showToast(message, "error");
    } finally {
    }
  };
    
  	const ActionButton = ({ onClick, tooltip, icon }) => (
		<div className="flex items-center space-x-2 cursor-pointer relative" onClick={onClick}>
				 <div className="relative">
			<Tooltip content={tooltip}>
			<span className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-darklink dark:text-white">
				<Icon icon={icon} height={18} />
			</span>
			</Tooltip>
			</div>
		</div>
	);


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
      columnHelper.accessor(
        (row) => `${row.firstName} ${row.lastName}`, // Combine firstName and lastName
        {
          id: "fullName",
          header: () => <Label>Full Name</Label>,
          cell: (info) => (
            <p className="text-darklink dark:text-bodytext text-sm">
              {info.getValue()}
            </p>
          ),
          enableSorting: true,
        }
      ) as ColumnDef<Client>,

      columnHelper.accessor("emailAddress", {
        id: "emailAddress",
        header: () => <Label>Email</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext  text-sm">
            {info.getValue()}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Client>,

      columnHelper.accessor("mobile", {
        id: "mobile",
        header: () => <Label>Mobile Number</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue()}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Client>,
      columnHelper.accessor("designation", {
        id: "designation",
        header: () => <Label>Designation</Label>,
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
          const rowData: any = row.original; // Get row data once to use in both handlers

          const handleEditClick = () => {
            const datas = {
              clientId: rowData?.clientId,
              isEdit: true,
              userId: rowData?.id,
            };
            const encoded = Buffer.from(JSON.stringify(datas)).toString(
              "base64"
            );
            router.push(`/client/add-user?data=${encoded}`);
          };

          const handleDeleteClick = () => {
            // handleDeleteClientUser(rowData?.id);
			setIsDeleteModalOpen({
							isOpen: true,
							data: rowData
						})
          };

         const handleViewClick = () => {
			      const datas = {
              clientId: rowData?.clientId,
              id: rowData?.id,
            };
            const encoded = Buffer.from(JSON.stringify(datas)).toString(
              "base64"
            );
           router.push(`/client/user/view-user?data=${encoded}`);
          };

          const handleTaskListClick = () => {
			      const datas = {
              clientId: rowData?.clientId,
              id: rowData?.id,
            };
            const encoded = Buffer.from(JSON.stringify(datas)).toString(
              "base64"
            );
           router.push(`/client/user/task-list?data=${encoded}`);
          };
          return (
            <div className="flex space-x-4">
				 		{canRead('jobtask') && (
							<ActionButton
								onClick={handleViewClick}
								tooltip="Agents"
								icon="solar:user-id-outline"
								/>
						)}
						{canRead('jobtask') && (
              				<ActionButton
							onClick={handleTaskListClick}
							tooltip="Job List"
							icon="solar:file-text-broken"
							/>
						)}
						{canUpdate('user') && (
							<ActionButton
							onClick={handleEditClick}
							tooltip="Edit"
							icon="solar:pen-new-square-broken"
							/>
						)}
						{canDelete('user') && (
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
    /* eslint-disable react/no-unescaped-entities */
    [selectedClientIds, pageIndex ,pageSize]
  );

 
  const fetchUsers = async () => {
    const payload = {
      body: {
        page: pageIndex + 1,
        pageSize,
        search,
        sortBy,
        sortOrder,
        clientId: parseInt(getClientId()),
      },
    };
    const res = await api.post("/client/getAllUsersList", payload);
    if (res.data.statusCode === 404) {
				console.error("No matching clients found");
				setData([]);
				setTotal(0);
			} else if (!res.data.error) {
				setData(res?.data?.data);
				setTotal(res?.data?.totalElements);
			}
  };
  useEffect(() => {
    fetchUsers();
  }, [pageIndex, pageSize, search, sortBy, sortOrder, getClientId()]);

  const datas = { clientId: getClientId(), isEdit: false };
  const encoded = Buffer.from(JSON.stringify(datas)).toString("base64");

  return (
    <>
	 {hasNoPermissions('user') ? (
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
				onSearchChange={(val: any) => {
				setPageIndex(0);
				setSearch(val);
				}}
				onPageSizeChange={setPageSize}
				onSortChange={(id, order) => {
				setPageIndex(0);
				setSortBy(id);
				setSortOrder(order);
				}}
				title="Users"
				pageSizeOptions={[10, 20, 30, 40, 50]}
				buttonName={canCreate('user')?  "Add User": 'no button'}
				buttonLink={`/client/add-user?data=${encoded}`}
				isForm={false}form={null}
			/>
		)}
		{selectedClientIds.length > 0 && (
							<div
								className="fixed left-1/2 bottom-8 transform -translate-x-1/2 z-50 flex items-center bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2"
								style={{ minWidth: 320 }}
							>
								<span className="mr-4 text-sm">{selectedClientIds.length} users selected</span>
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
							<ModalRolePermissionUser
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
				isOpen={isDeleteModalOpen?.isOpen}
				onClose={() => onCloseDeleteModal()}
				onConfirm={() => handleDeleteClientUser(isDeleteModalOpen?.data?.id)}
				title={`Delete User?`}
				message="Are you sure you want to delete this user? This action cannot be undone."
				confirmButtonText="Yes"
				cancelButtonText="No"
				confirmButtonColor="failure"
      		/>
    </>
  );
};

export default UserList;
