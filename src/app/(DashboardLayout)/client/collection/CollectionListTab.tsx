"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Label, Tooltip } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useNoPermissions, usePermissions } from '@/hooks/usePermissions';

import DeleteWarningModal from "@/app/components/shared/DeleteWarningModal";
import { Icon } from "@iconify/react";
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
  name: string;
  description: string;
  isDeleted?: boolean | null;
  actions?: any;
}

interface DeleteModalState {
	isOpen?: boolean  | null;
	data?: any
}

const columnHelper = createColumnHelper<Client>();

const CollectionTabList = () => {
  const { getClientId } = useClientStore();
  const { canCreate, canRead, canUpdate, canDelete } = usePermissions();
   const { hasNoPermissions } = useNoPermissions();
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
const [isLoading, setIsLoading] = useState(false);

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

  const handleDeleteCollection = async (id: any) => {
    try {
      const payload = {
        body: {
          id: parseInt(id),
          isDeleted: true,
        },
      };
      const response = await api.post(
        "/collection/updateClientCollection",
        payload
      );
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

  const columns: ColumnDef<Client>[] = useMemo(
    () => [
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
      columnHelper.accessor("name", {
        id: "name",
        header: () => <Label>Name</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue()}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Client>,

      columnHelper.accessor("description", {
        id: "description",
        header: () => <Label>Description</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext  text-sm">
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
              collectionId: rowData?.id,
            };
            const encoded = Buffer.from(JSON.stringify(datas)).toString(
              "base64"
            );
            router.push(`/client/collection/add-collection?data=${encoded}`);
          };

          const handleDeleteClick = () => {
          //  handleDeleteCollection(rowData?.id);
		  setIsDeleteModalOpen({
							isOpen: true,
							data: rowData
						})
          };

          const handleCollectionDocument = () => {
            const datas = {
              clientId: rowData?.clientId,
              collectionId: rowData?.id,
            };
            const encoded = Buffer.from(JSON.stringify(datas)).toString(
              "base64"
            );
            router.push(`/client/collection/add-documents?data=${encoded}`);
          };

          const handleViewCollectionDocument = () => {
            const datas = {
              clientId: rowData?.clientId,
              collectionId: rowData?.id,
            };
            const encoded = Buffer.from(JSON.stringify(datas)).toString(
              "base64"
            );
            router.push(`/client/collection/list-document?data=${encoded}`);
          };

          return (

			<div className="flex space-x-4">
				 			{canCreate('collection') && (
								<ActionButton
								onClick={handleCollectionDocument}
								tooltip="Add Collection Document"
								icon= "solar:add-circle-broken"
								/>
				 			)}
							{canRead('collection') && (
								<ActionButton
								onClick={handleViewCollectionDocument}
								tooltip="View Collection Document"
								icon="solar:eye-broken"
								/>
							)}
							{canUpdate('collection') && (
								<ActionButton
								onClick={handleEditClick}
								tooltip="Edit"
								icon="solar:pen-new-square-broken"
								/>
							)}
							{canDelete('collection') && (
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
    [pageIndex ,pageSize]
  );

  const fetchUsers = async () => {
	 setIsLoading(true);
  try {
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
    const res = await api.post("/collection/getClientCollectionList", payload);
   if (res.data.statusCode === 404) {
				console.error("No matching clients found");
				setData([]);
				setTotal(0);
			} else if (!res.data.error) {
				setData(res?.data?.data);
				setTotal(res?.data?.totalElements);
			}
	} catch (error) {
     setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
  };
  useEffect(() => {
    fetchUsers();
  }, [pageIndex, pageSize, search, sortBy, sortOrder, getClientId()]);

  const datas = { clientId: getClientId(), isEdit: false };
  const encoded = Buffer.from(JSON.stringify(datas)).toString("base64");

  return (
    <>
		  {hasNoPermissions('collection') ? (
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
				  title="Collection"
				  pageSizeOptions={[10, 20, 30, 40, 50]}
				  // buttonName="Add Collection"
				  buttonName={canCreate('collection') ? "Add Collection" : 'no button'}
				  buttonLink={`/client/collection/add-collection?data=${encoded}`}
				  isForm={false}
				  form={null}
				  isLoading={isLoading}
			  />
		  )}
	  		<DeleteWarningModal
				isOpen={isDeleteModalOpen?.isOpen ?? false}
				onClose={() => onCloseDeleteModal()}
				onConfirm={() => handleDeleteCollection(isDeleteModalOpen?.data?.id)}
				title={`Delete Collection?`}
				message="Are you sure you want to delete this collection? This action cannot be undone."
				confirmButtonText="Yes"
				cancelButtonText="No"
				confirmButtonColor="failure"
      />
    </>
  );
};

export default CollectionTabList;
