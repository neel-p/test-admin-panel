"use client";

import { Button, Label } from "flowbite-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { Spinner } from "flowbite-react";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */


function PaginationTable<T>({
  columns = [],
  data = [],
  total = 0,
  pageIndex = 0,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  onSearchChange = () => {},
  onSortChange = () => {},
  title = "",
  pageSizeOptions = [10, 20, 50],
  buttonName = "Add",
  buttonLink = "#",
  isForm = false,
  form = null,
  isLoading = false,
}: any) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      sorting,
	   pagination: {
      pageIndex,
      pageSize,
    },
    },
    onSortingChange: (newSort: any) => {
      setSorting(newSort);
      const sort = newSort[0];
      if (sort) {
        onSortChange(sort.id, sort.desc ? "desc" : "asc");
      } else {
        onSortChange("", "asc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      onSearchChange(search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);
  const safeColumns = columns || [];
  const safeData = data || [];
  const safePageSizeOptions = pageSizeOptions || [];
  return (
    <>
      <TitleIconCard title={title}>
        <div className="border rounded-md border-ld overflow-hidden">
          <div className="p-4">
            <div className="flex sm:flex-row flex-col gap-6 mb-4">
              <div className="">
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control-input"
                />
						  </div>
						  {buttonName !== "no button" ? (
							  <div className="">
								  <Button
									  color={"primary"}
									  href={buttonLink}
									  as={Link}
									  className="w-full"
								  >
									  {buttonName}
								  </Button>
							  </div>
						  ) : null}
              {isForm ? <div className="">{form()}</div>  : null}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {!Array.isArray(columns) ||
                (!Array.isArray(data) && <div>Loading table...</div>)}
              <thead>
                {table?.getHeaderGroups()?.map((headerGroup, index) => (
                  <tr key={headerGroup.id || index}>
                    {headerGroup?.headers?.map((header, index1) => (
                      <th
                        key={`${headerGroup.id}-${header.id}-${index1}`}
                        className="text-base text-ld font-semibold py-3 text-left border-b border-ld px-4 cursor-pointer text-gray-900"
                        onClick={() => header.column.toggleSorting()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        <span>
                          {/* {header?.column?.getIsSorted()
                            ? header.column.getIsSorted() === "asc"
                              ? " 🔼"
                              : " 🔽"
                            : ""} */}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border dark:divide-darkborder">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={safeColumns.length}
                      className="text-center py-8 px-4"
                    >
                      <div className="flex flex-col items-center">
                        <Spinner
                          size="xl"
                          aria-label="Loading data"
                          light
                        />
                      </div>
                    </td>
                  </tr>
                ) : table?.getRowModel()?.rows?.length ? (
                  table?.getRowModel()?.rows?.map((row, index) => (
                    <tr key={`row-${row.id}-${index}`}>
                      {row?.getVisibleCells()?.map((cell, index1) => (
                        <td
                          key={`${row.id}-${cell.id}-${index1}`}
                          className="py-3 px-4 text-gray-900 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={safeColumns.length}
                      className="text-center py-8 px-4"
                    >
                      <div className="flex flex-col items-center">
                        <Label>No Data Found</Label>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="sm:flex gap-2 p-3 items-center justify-between">
            <div className="flex items-center gap-2"></div>
            <div className="sm:flex  items-center gap-2 sm:mt-0 mt-3">
              <div className="sm:flex items-center gap-2">
                <div className="flex ">
                  <h2 className="text-gray-700 pe-1">Page</h2>
                  <h2 className="font-semibold text-gray-900">
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </h2>
                </div>
                <div className="flex items-center gap-2 "></div>
                <div className="select-md sm:mt-0 mt-3">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      onPageSizeChange(Number(e.target.value));
                      onPageChange(0); // reset to first page
                    }}
                    className="border  w-20"
                  >
                    {safePageSizeOptions?.map((pageSize: any, index) => (
                      <option key={pageSize || index} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 sm:mt-0 mt-3">
                  <Button
                    size="small"
                    onClick={() => onPageChange(0)}
                    disabled={pageIndex === 0}
                    className="bg-lightgray text-gray-900 dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50 border border-dark text-dark hover:bg-dark hover:text-white dark:text-white"
                  >
                    <IconChevronsLeft className="text-ld" size={20} />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
                    disabled={pageIndex === 0}
                    className="bg-lightgray text-gray-900 dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50 border border-dark text-dark hover:bg-dark hover:text-white dark:text-white"
                  >
                    <IconChevronLeft className="text-ld" size={20} />
                  </Button>

                  <Button
                    size="small"
                    onClick={() =>
                      onPageChange(
                        pageIndex + 1 < total / pageSize
                          ? pageIndex + 1
                          : pageIndex
                      )
                    }
                    disabled={pageIndex + 1 >= total / pageSize}
                    className="bg-lightgray text-gray-900 dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50 border border-dark text-dark hover:bg-dark hover:text-white dark:text-white"
                  >
                    <IconChevronRight className="text-ld" size={20} />
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>{
						 const lastPage = Math.ceil(total / pageSize) - 1;
                      onPageChange(lastPage)
					}}
                    disabled={pageIndex + 1 >= total / pageSize}
                    className="bg-lightgray text-gray-900 dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50 border border-dark text-dark hover:bg-dark hover:text-white dark:text-white"
                  >
                    <IconChevronsRight className="text-ld" size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TitleIconCard>
    </>
  );
}

export default PaginationTable;
