"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { Button, Label, Tooltip } from "flowbite-react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@iconify/react";
import PaginationTable from "@/app/components/react-tables/pagination/page"
import api from "@/utils/axios";
import { useClientStore } from "@/stores/clientStore";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastManager";

interface Candidate {
  id: string;
  taskId?: any;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  currentTitle: string;
  sourceType?: string;
  totalYearsExperience: string;
	actions?: any;
	firstName?: any;
}

const columnHelper = createColumnHelper<Candidate>();

const TalentPoolList = () => {
  const { getClientId } = useClientStore();
  const router = useRouter();
  const { showToast } = useToast();
  const { handleApiResponse } = useHandleApiResponse();
  const [data, setData] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("candidate_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
const [isLoading, setIsLoading] = useState(false);
  const handleViewCandidate = (candidate: Candidate) => {
    const encodedData = Buffer.from(JSON.stringify(candidate)).toString("base64");
    router.push(`/talent-pool/${candidate.id}?data=${encodedData}`);
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

    
   const columns: ColumnDef<Candidate>[] = useMemo(
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
      }) as ColumnDef<Candidate>,
	  columnHelper.accessor("taskId", {
        id: "taskId",
        header: () => <Label>Job Id</Label>,
         cell: (info) => (
          <p className="text-darklink dark:text-bodytext  text-sm">
            {info.getValue() ? String(info.getValue()) : 'N/A'}
          </p>
        ),
        enableSorting: false,
      }) as ColumnDef<Candidate>,

	   columnHelper.accessor("sourceType", {
        id: "sourceType",
        header: () => <Label>Source Type</Label>,
        cell: (info) => (
          <span className={`px-3 py-1 rounded-full text-sm
            ${info.getValue() === "inbound"
              ? 'bg-lightprimary text-primary'
              : 'bg-lightprimary text-primary'
            }`}>
            {info.getValue() || 'N/A'}
          </span>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,

	   columnHelper.accessor("fullName", {
        id: "fullName",
        header: () => <Label>Full Name</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext  text-sm">
            {info.getValue() || 'N/A'}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,


      columnHelper.accessor("email", {
        id: "email",
        header: () => <Label>Email</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext  text-sm">
            {info.getValue() || 'N/A'}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,

      columnHelper.accessor("phone", {
        id: "phone",
        header: () => <Label>Mobile Number</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue() || 'N/A'}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,
      columnHelper.accessor("currentTitle", {
        id: "currentTitle",
        header: () => <Label>Designation</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue() || 'N/A'}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,
	    
	 
	  columnHelper.accessor("totalYearsExperience", {
        id: "totalYearsExperience",
        header: () => <Label>Experience</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue() || 'N/A'}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,
	  
	    columnHelper.accessor("city", {
        id: "city",
        header: () => <Label>Location</Label>,
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue() || 'N/A'}
          </p>
        ),
        enableSorting: true,
      }) as ColumnDef<Candidate>,

      columnHelper.accessor("actions", {
        id: "actions",
        cell: ({ row }) => {
          const rowData: any = row.original; // Get row data once to use in both handlers

  		 const handleDownloadClick = async () => {
			try {
				if (rowData?.documentUrl) {
				const response = await fetch(rowData.documentUrl);
				if (!response.ok) {
					throw new Error("Failed to fetch the file");
				}

				const blob = await response.blob();
				const blobUrl = window.URL.createObjectURL(blob);

				const link = document.createElement('a');
				link.href = blobUrl;
				link.setAttribute('download', `candidate_${rowData?.fullName}_resume.pdf`);
				document.body.appendChild(link);
				link.click();

				document.body.removeChild(link);
				window.URL.revokeObjectURL(blobUrl); // Clean up
				} else {
				showToast("Resume download URL not available", "error");
				}
			} catch (error) {
				console.error("Download error:", error);
				showToast("Error downloading resume", "error");
			}
		};
			
          return (
           <div className="flex space-x-4">
              <ActionButton
                onClick={() => handleViewCandidate(rowData)}
                tooltip="View Details"
                icon="solar:eye-broken"
              />
			  {rowData.documentUrl ? (
              <ActionButton
                onClick={handleDownloadClick}
                tooltip="Download Resume"
                icon="solar:cloud-download-broken"
              />
			  ) : null}
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
        clientId: parseInt(getClientId())
      },
    };
    const res = await api.post("/talentPool/getTalentPoolList", payload);
   if (res.data.statusCode === 404) {
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
  }
  };

  useEffect(() => {
    fetchUsers();
  }, [pageIndex, pageSize, search, sortBy, sortOrder, getClientId()]);

  const datas = { clientId: getClientId(), isEdit: false };
  const encoded = Buffer.from(JSON.stringify(datas)).toString("base64");

  return (
    <>
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
        title="Talent Pool"
        pageSizeOptions={[10, 20, 30, 40, 50]}
        buttonName="no button"
        buttonLink={`/client/add-user?data=${encoded}`}
        isForm={false}
			  form={null}
			  isLoading={isLoading}
      />
    </>
  );
};

export default TalentPoolList;
