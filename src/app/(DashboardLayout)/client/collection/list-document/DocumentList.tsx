"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Label, Tooltip } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";

import DeleteWarningModal from "@/app/components/shared/DeleteWarningModal";
import { Icon } from "@iconify/react";
import PaginationTable from '@/app/components/react-tables/pagination/page'
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastManager";
import Loader from "@/app/components/Loader";

interface Client {
  createdAt?: string;
  createdBy?: string | null;
  modifiedBy?: string | null;
  modifiedAt?: string;
  id: number;
  name: string;
  description: string;
  filePath: string
  isDeleted?: boolean | null;
  actions?: any;
  vectorisationStatus?: any
}
const columnHelper = createColumnHelper<Client>();

interface DeleteModalState {
	isOpen?: boolean  | null;
	data?: any
}



const DocumentList = () => {
	const { canCreate, canRead, canUpdate, canDelete } = usePermissions();
  const searchParams = useSearchParams();
  const searchParamsData = searchParams?.get("data");
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
const [isInitialLoad, setIsInitialLoad] = useState(true);

  const decodedData = useMemo(() => {
    if (searchParamsData) {
      try {
        const jsonStr = Buffer.from(searchParamsData, "base64").toString();
        return JSON.parse(jsonStr);
      } catch (err) {
        console.error("Failed to decode", err);
      }
    }
    return null;
  }, [searchParamsData]);

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



  const handleDeleteCollection = async (id: any) => {
    try {
      const payload = {
        body: {
          id: parseInt(id),
          isDeleted: true,
        },
      };
      const response = await api.post(
        "/document/updateDocument",
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

  const ActionButton = ({ onClick, tooltip, icon }) => (
		<div className="flex items-center space-x-2 cursor-pointer relative" onClick={onClick}>
				 <div className="relative">
			<Tooltip content={tooltip}>
			<span className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-darklink dark:text-white svg18">
				<Icon icon={icon} height={18} />
			</span>

			</Tooltip>
			</div>
		</div>
	);

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

	   columnHelper.accessor("vectorisationStatus", {
                id: "vectorisationStatus",
                header: () => <Label>Status</Label>,
                cell: (info) => (
                  
						
						    <span className={`px-3 py-1 rounded-full text-sm
							${info.getValue() === "prepared"
							? 'bg-lightprimary  text-primary'
							: info.getValue() === "failed" || info.getValue() === "cancelled"
							? 'bg-red-100 text-red-600'
							: 'bg-lightprimary  text-primary'
							}`}>
							 {String(info.getValue() || '-')}
						</span>
                
                ),
                enableSorting: true,
	   }) as ColumnDef<Client>,
	   
      columnHelper.accessor("actions", {
        id: "actions",
        cell: ({ row }) => {
          const rowData: any = row.original; // Get row data once to use in both handlers

          const handleDeleteClick = () => {
          //  handleDeleteCollection(rowData?.id);
		  	setIsDeleteModalOpen({
							isOpen: true,
							data: rowData
						})
          };

          const handleViewFile = () => {
            if (rowData?.filePath) {
              window.open(rowData.filePath, '_blank');
            }
          };

          return (

			<div className="flex space-x-4">
                <ActionButton
                  onClick={handleViewFile}
                  tooltip="View File"
                  icon="solar:eye-broken"
                />
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
    [pageIndex , pageSize]
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
        clientCollectionId: parseInt(decodedData?.collectionId),
      },
    };
    const res = await api.post("/document/getDocumentList", payload);
   if (res.data.statusCode === 404) {
				console.error("No matching clients found");
				setData([]);
				setTotal(0);
			} else if (!res.data.error) {
				setData(res?.data?.data);
				setTotal(res?.data?.totalElements);
			}
	 } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
	setIsInitialLoad(false);
  }
  };
  useEffect(() => {
    fetchUsers();
  }, [
    pageIndex,
    pageSize,
    search,
    sortBy,
    sortOrder,
    decodedData?.collectionId,
  ]);

  return (
    <>
		  {isInitialLoad ? (
			  // You can use any loader/spinner component here
			  <Loader color="primary" />
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
				  buttonName="Back"
				  buttonLink={`/client/collection`}
				  isForm={false}
				  form={null}
				  isLoading={isLoading}
			  />
		  )}
	  <DeleteWarningModal
				isOpen={isDeleteModalOpen.isOpen ?? false}
				onClose={() => onCloseDeleteModal()}
				onConfirm={() => handleDeleteCollection(isDeleteModalOpen?.data?.id)}
				title={`Delete Document?`}
				message="Are you sure you want to delete this document? This action cannot be undone."
				confirmButtonText="Yes"
				cancelButtonText="No"
				confirmButtonColor="failure"
      />
    </>
  );
};

export default DocumentList;
