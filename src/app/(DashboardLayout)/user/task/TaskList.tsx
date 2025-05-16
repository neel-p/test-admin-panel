"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { Card, Label, Modal, Spinner, Tooltip } from "flowbite-react";
import { capitalizeLabel, safeSplit } from '@/utils/commonFUnction';
import { useEffect, useMemo, useState } from "react";
import { useNoPermissions, usePermissions } from '@/hooks/usePermissions';

import DeleteWarningModal from "@/app/components/shared/DeleteWarningModal";
import DynamicForm from "./DynamicForm"
import { Icon } from "@iconify/react";
import PaginationTable from '@/app/components/react-tables/pagination/page'
import api from "@/utils/axios";
import api1 from "@/utils/axiosPython";
import { createColumnHelper } from "@tanstack/react-table";
import { getDecryptedData } from "@/utils/secureStorage";
import { useClientStore } from "@/stores/clientStore";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastManager";

interface TaskData {
	id: number;
	userId: number;
	agentId: number;
	name: string;
	input: {
		project_description?: string;
		required_skills?: string[];
		location?: string;
		experience?: string;
		job_title?: string;
		[key: string]: any; // For dynamic fields
	};
	output: any;
	status: string;
	isDeleted: boolean;
	actions?: any;
}

interface GroupedFields {
	arrays: [string, any][];
	objects: [string, any][];
	strings: [string, any][];
}

interface DeleteModalState {
	isOpen: boolean;
	data: TaskData | null;
}

const columnHelper = createColumnHelper<TaskData>();

const ViewTaskModal = ({ task, onClose }: { task: TaskData | null, onClose: () => void }) => {
	const formatText = (text: string) => {
		if (!text) return 'N/A';
		
		// Handle newlines
		let formattedText = text
			.replace(/\n/g, '<br>')
			// Bold text
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			// Italic text
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			// Underline text
			.replace(/__(.*?)__/g, '<u>$1</u>')
			// Strikethrough text
			.replace(/~~(.*?)~~/g, '<s>$1</s>')
			// Links
			.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
			// URLs
			.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
			// Numbered lists
			.replace(/^\d+\.\s+(.*)$/gm, '<li class="list-decimal ml-4">$1</li>')
			// Bullet lists
			.replace(/^-\s+(.*)$/gm, '<li class="list-disc ml-4">$1</li>')
			// Headers
			.replace(/^#\s+(.*)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
			.replace(/^##\s+(.*)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
			.replace(/^###\s+(.*)$/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
			// Code blocks
			.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg font-mono text-sm"><code>$1</code></pre>')
			// Inline code
			.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded font-mono text-sm">$1</code>')
			// Blockquotes
			.replace(/^>\s+(.*)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>');

		return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
	};

	const renderField = (label: string, value: any, className: string = "") => {
		if (value === undefined || value === null || value === "" || 
			(Array.isArray(value) && value.length === 0) || 
			(typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
			return (
				<div className={`flex flex-col ${className} p-4 bg-white rounded-lg border border-gray-200`}>
					<Label className="text-gray-600 font-medium mb-1">{label}</Label>
					<span className="text-gray-400">N/A</span>
				</div>
			);
		}
		return (
			<div className={`flex flex-col ${className} p-4 bg-white rounded-lg border border-gray-200`}>
				<Label className="text-gray-600 font-medium mb-1">{label}</Label>
				<div className="prose prose-sm max-w-none">
					{typeof value === 'string' ? formatText(value) : String(value)}
				</div>
			</div>
		);
	};

	const renderArrayField = (label: string, items: any[] = [], renderItem: (item: any, index: number) => React.ReactNode) => {
		if (!items?.length) {
			return (
				<div className="p-4 bg-white rounded-lg border border-gray-200">
					<Label className="text-gray-600 font-medium mb-1">{label}</Label>
					<div className="text-gray-400">N/A</div>
				</div>
			);
		}
		return (
			<div className="p-4 bg-white rounded-lg border border-gray-200">
				<Label className="text-gray-600 font-medium mb-1">{label}</Label>
				<div className="flex flex-wrap gap-2 mt-1">
					{items.map((item, index) => renderItem(item ?? 'N/A', index))}
				</div>
			</div>
		);
	};

	const renderContent = () => {
		if (!task) return null;

		// Filter out JD and other excluded fields
		const filteredInput = Object.entries(task.input || {}).filter(([key]) => 
			!['jd', 'JD', 'detail', 'DETAIL'].includes(key.toLowerCase())
		);

		// Group fields into sections based on their type
		const groupedFields = filteredInput.reduce<GroupedFields>((acc, [key, value]) => {
			const isArray = Array.isArray(value);
			const isObject = typeof value === 'object' && value !== null;
			const isString = typeof value === 'string';
			
			if (isArray) {
				acc.arrays.push([key, value]);
			} else if (isObject) {
				acc.objects.push([key, value]);
			} else if (isString) {
				acc.strings.push([key, value]);
			}
			
			return acc;
		}, { arrays: [], objects: [], strings: [] });

		return (
			<div className="space-y-6">
				<Card className="prose prose-sm max-w-none">
					<h2 className="text-xl font-semibold mb-4">Input Details</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{groupedFields.strings.map(([key, value]) => (
							renderField(
								key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
								value
							)
						))}
						{groupedFields.arrays.map(([key, value]) => (
							renderArrayField(
								key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
								value,
								(item, index) => (
									<span
										key={index}
										className="px-3 py-1 bg-lightprimary text-primary rounded-full text-sm"
									>
										{typeof item === 'string' ? formatText(item) : String(item)}
									</span>
								)
							)
						))}
					</div>
				</Card>

			

				{task.output && Object.keys(task.output).length > 0 && (
					<Card className="prose prose-sm max-w-none">
						<h2 className="text-xl font-semibold mb-4">Output Details</h2>
						<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
							{Object.entries(task.output).map(([key, value]) => {
								if (typeof value === 'object' && value !== null) {
									return (
										<div key={key} className="p-4 bg-white rounded-lg border border-gray-200">
											<h3 className="text-lg font-medium mb-2">
												{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
											</h3>
											<div className="pl-4 border-l-4 border-primary">
												{Object.entries(value).map(([subKey, subValue]) => (
													<div key={subKey} className="mb-2">
														<div className="inline-block">
															{typeof subValue === 'string' ? formatText(subValue) : String(subValue)}
														</div>
													</div>
												))}
											</div>
										</div>
									);
								}
								return renderField(
									key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
									value
								);
							})}
						</div>
					</Card>
				)}
			</div>
		);
	};
return (
		<Modal
			show={task !== null}
			onClose={onClose}
			size="7xl"
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
					base: "relative w-full max-w-7xl mx-auto p-0",
					inner: "relative rounded-lg bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]"
				}
			}}
		>
			<Modal.Header className="px-4 py-3 flex justify-between items-center">
				<span>View Job Details</span>
			</Modal.Header>
			<Modal.Body className="overflow-y-auto flex-1 p-4">
				{renderContent()}
			</Modal.Body>
		</Modal>
	);
};


const TaskList = () => {
	const { selectedClient } = useClientStore();
	const { canCreate, canRead, canUpdate, canDelete } = usePermissions();
	  const { hasNoPermissions } = useNoPermissions();
	 const localData = getDecryptedData("user", "cookie");{{}}
	const router = useRouter();
	const { showToast } = useToast();
	const { handleApiResponse } = useHandleApiResponse();
	const [data, setData] = useState<TaskData[]>([]);
	const [total, setTotal] = useState(0);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("id");
	const [createTask, setCreateTask] = useState<TaskData | null>(null);
    const [isView, setIsView] = useState(false);
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


    const handleFormSubmit = async (
		values: Record<string, any>,
		{ setSubmitting }: { setSubmitting: (val: boolean) => void }
		) => {
	  try {
			if (!createTask) return;
			const payload= {
				body:{
				  	"userId": localData?.id,
					"agentId": createTask?.agentId,
					"name": "",
					"input": values,
					"output": {},
                    "id": createTask?.id,
				}
			}

			 const response = await api.post("/agentTask/updateTask",
              payload
            );
            // Handle success
            handleApiResponse(response);
            if ( response?.data?.statusCode === 200 ||
        		response?.data?.statusCode === 201) {
              router.push(`/user/task`);
            }
			await new Promise((res) => setTimeout(res, 2000)); // simulate API
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
		};

    const handleDeleteClientUser = async (id: any) => {
        try {
          const payload = {
            body: {
             id: parseInt(id),
              isDeleted: true,
            },
          };
          const response = await api.post("/agentTask/updateTask", payload);
          handleApiResponse(response);
          if (
            response?.data?.statusCode === 200 ||
            response?.data?.statusCode === 201
          ) {
            fetchUsers();
          }
        } catch (error: any) {
          const message = error?.response?.data?.message || "Network error";
          showToast(message, "error");
        } finally {
        }
      };

      
    const handleOutBound = async (id: any) => {
        try {
          const payload = {
            body: {
             id: parseInt(id),
            },
          };
          const response = await api1.post("/Agent/OutBoundAgent", payload);
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


const columns = useMemo(
    () => {
        const inputFields = new Set<string>();
        data?.forEach((row) => {
            if (row?.input) {
                Object.keys(row.input).forEach((field) => inputFields.add(field));
            }
        });

        const excludeKeys = ['jd', 'detail', 'JD', 'DETAIL'];
        const dynamicColumns = Array.from(inputFields)
            .filter((field) => !excludeKeys.includes(field))
            .map((field) =>
                columnHelper.accessor((row) => row?.input?.[field], {
                    id: field,
                    header: () => (
                        <Label>
                            {capitalizeLabel(field)}
                        </Label>
                    ),
                    cell: (info) => {
                        const value = info.getValue();
                        return (
                            <p className="whitespace-normal break-words max-h-40 overflow-auto text-darklink dark:text-bodytext text-sm leading-relaxed">
                                {Array.isArray(value)
                                    ? value.join(', ')
                                    : value || '-'}
                            </p>
                        );
                    },
                    enableSorting: true,
                })
            );

        return [
            columnHelper.accessor("id", {
                id: "id",
                header: () => <Label>Sr No</Label>,
                cell: (info) => (
                    <p className="text-sm text-darklink dark:text-bodytext">
                      {pageIndex * pageSize + info.row.index + 1}
                    </p>
                ),
                enableSorting: false,
            }),
			columnHelper.accessor("id", {
					id: "id",
					header: () => <Label>Job Id</Label>,
					cell: (info) => (
						<p className="text-sm text-darklink dark:text-bodytext">
						{info.getValue()}
						</p>
					),
					enableSorting: false,
				}),
            ...dynamicColumns,
             columnHelper.accessor("status", {
                id: "status",
                header: () => <Label>Status</Label>,
                cell: (info) => (
						<span className={`px-3 py-1 rounded-full text-sm
							${info.getValue() === "prepared"
							? 'bg-lightprimary text-primary'
							: info.getValue() === "failed" || info.getValue() === "cancelled"
							? 'bg-red-100 text-red-600'
							: 'bg-lightprimary text-primary'
							}`}>
							{(info.getValue() as string)?.charAt(0).toUpperCase() + 
											(info.getValue() as string)?.slice(1) || '-'}
						</span>
                ),
                enableSorting: true,
			}),
            columnHelper.accessor("actions", {
                id: "actions",
                enableSorting: false,
                header: () => <Label>Action</Label>,
                cell: ({ row }) => {
                    const rowData = row.original;
                  const handleDeleteClick = () => {
							//handleDeleteClientUser(rowData?.id);
							setIsDeleteModalOpen({
							isOpen: true,
							data: rowData
						})
						}
                    const handleEditClick =()=>{
                        setCreateTask(rowData); 
                        setIsView(false)
                    }
                    const handleOutboundClick =()=>{
                        handleOutBound(rowData?.id);
                    }
                    return (
                        <div className="flex space-x-4">
							{canRead('jobtask') && (
                            <ActionButton
                                onClick={() => {
                                    setCreateTask(rowData); 
                                    setIsView(true)
                                }}
                                tooltip="View Job Details"
                                icon="solar:eye-broken"
                            />
							)}
							{canUpdate('jobtask') && (
								<ActionButton
									onClick={handleEditClick}
									tooltip="Edit Job"
									icon="solar:pen-new-square-broken"
								/>
							)}
							{canDelete('jobtask') && (
								<ActionButton
									onClick={handleDeleteClick}
									tooltip="Delete"
									icon="solar:trash-bin-minimalistic-outline"
								/>		
							)}
							{canCreate('jobtask') && (
                            	rowData.status?.toLocaleLowerCase() === "prepared" && (
                                <ActionButton
                                    onClick={handleOutboundClick}
                                    tooltip="OutBound Search"
                                    icon="solar:magnifer-zoom-in-broken"
                                />
                            )
							)}
                        </div>
                    );
                },
            }),
        ];
    },
    [data, pageIndex ,pageSize]
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
				userId: parseInt(localData?.id),
			},
		};
		const res = await api.post("/agentTask/UserAgentTaskList", payload);

		if (!res.data.error) {
			setData(res?.data?.data);
			setTotal(res?.data?.totalElements);
		} else {
			setData([]);
			setTotal(0);
		}
		  } catch (error) {
     setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
	};

	useEffect(() => {
		fetchUsers();
	}, [pageIndex, pageSize, search, sortBy, sortOrder, localData?.id]);

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
				title="Job List"
				pageSizeOptions={[10, 20, 30, 40, 50]}
				buttonName="no button" 
				buttonLink={`/client/user`}
				isForm={false}
				form={null}
				 isLoading={isLoading}
			/> 
			)}

<DeleteWarningModal
				isOpen={isDeleteModalOpen.isOpen ?? false}
				onClose={() => onCloseDeleteModal()}
				onConfirm={() => handleDeleteClientUser(isDeleteModalOpen?.data?.id)}
				title={`Delete Job?`}
				message="Are you sure you want to delete this job? This action cannot be undone."
				confirmButtonText="Yes"
				cancelButtonText="No"
				confirmButtonColor="failure"
      />


           {isView ? (
				<ViewTaskModal task={createTask} onClose={() => setCreateTask(null)} />
			) : (
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
							base: "relative w-full max-w-7xl mx-auto p-0",
							inner: "relative rounded-lg bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]"
						}
					}}
				>
					<Modal.Header className="px-4 py-3">Edit Job</Modal.Header>
					<Modal.Body className="overflow-y-auto flex-1 p-4">
						<DynamicForm
							inputSchema={createTask?.input || []}
							onSubmit={handleFormSubmit}
							isView={isView}
						/>
					</Modal.Body>
				</Modal>
					)}
		</>
	);
};

export default TaskList;
