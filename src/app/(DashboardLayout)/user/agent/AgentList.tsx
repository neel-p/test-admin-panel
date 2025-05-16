"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Label, Modal, Tooltip } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useNoPermissions, usePermissions } from '@/hooks/usePermissions';

import DynamicForm from "../task/DynamicForm"
import { Icon } from "@iconify/react";
import PaginationTable from '@/app/components/react-tables/pagination/page'
import api from "@/utils/axios";
import api1 from "@/utils/axiosPython";
import { getDecryptedData } from "@/utils/secureStorage";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
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

interface Agent {
	id: number;
	name: string;
	description: string;
	inputSchema?: any;
	agentId: any
}

const columnHelper = createColumnHelper<Client>();

const AgentList = () => {
	const { canCreate } = usePermissions();
	  const { hasNoPermissions } = useNoPermissions();
	const router = useRouter();
	 const localData = getDecryptedData("user", "cookie");{{}}
	const { handleApiResponse } = useHandleApiResponse();
	const [data, setData] = useState<Client[]>([]);
	const [total, setTotal] = useState(0);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("id");
	const [createTask, setCreateTask] = useState<Agent | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
const [isLoading, setIsLoading] = useState(false);
		
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
	
 const handleFormSubmit = async (
		values: Record<string, any>,
		{ setSubmitting }: { setSubmitting: (val: boolean) => void }
		) => {
	  try {
			if (!createTask) return;
			// First API call
			const firstApiResponse = await api1.post("/Agent/Validation", {
				body: values
			});
			handleApiResponse(firstApiResponse);
		  if (firstApiResponse?.data?.statusCode !== 200) {
				setCreateTask(null)
				throw new Error("First API call failed");
			}
			// If first API call is successful, proceed to the second API call
			const payload = {
				body: {
					"userId": localData?.id,
					"agentId": createTask?.agentId,
					"name": "",
					"input": values,
					"output": {}
				}
			};
			const response = await api.post("/agentTask/createTask", payload);
			// Handle success
			handleApiResponse(response);
			if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
				router.push(`/client/user`);
			}
			await new Promise((res) => setTimeout(res, 2000)); // simulate API
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
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

					return (
						<div className="flex space-x-4">
							{canCreate('jobtask') && (
								<ActionButton
								onClick={(e) =>  setCreateTask(rowData)}
								tooltip="Create Job"
								icon="solar:file-text-broken"
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
				clientId: parseInt(localData?.clientId),
			},
		};
		const res = await api.post("/user/clientAgentList", payload);
		if (!res.data.error) {
			setData(res?.data?.data);
			setTotal(res?.data?.totalElements);
		}else{
			setData([]);
			setTotal(0);
	  }
	   } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
	};
	useEffect(() => {
		fetchUsers();
	}, [pageIndex, pageSize, search, sortBy, sortOrder, localData?.clientId]);

	return (
		<>
		 {hasNoPermissions('jobtask') ? (
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
				title="User Agents"
				pageSizeOptions={[10, 20, 30, 40, 50]}
				buttonName="no button"
				buttonLink={`/client/user`}
				isForm={false}
				form={null}
				isLoading={isLoading}
			/>
		  )}
			<Modal
				show={createTask !== null}
				onClose={() => setCreateTask(null)}
				size="xl"
				className="overflow-y-auto fixed inset-0 z-50"
				theme={{
					root: {
						base: "fixed top-0 right-0 left-0 z-50 h-screen w-full overflow-y-auto overflow-x-hidden md:inset-0 md:h-full bg-gray-900 bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center",
						show: {
							on: "flex",
							off: "hidden"
						}
					},
					content: {
						base: "relative w-full max-w-7xl mx-auto p-4",
						inner: "relative rounded-lg bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]"
					}
				}}
			>
				<Modal.Header>Create Job</Modal.Header>
				<Modal.Body className="overflow-y-auto flex-1">
					<DynamicForm
						inputSchema={createTask?.inputSchema}
						onSubmit={handleFormSubmit}
					/>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default AgentList;
