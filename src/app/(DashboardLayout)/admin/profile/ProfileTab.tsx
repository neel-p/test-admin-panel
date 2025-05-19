"use client";

import { Label, Spinner, Tooltip  } from "flowbite-react";
import React, { useEffect, useState, useMemo } from "react";

import api from "@/utils/axios";
import { useSearchParams } from "next/navigation";
import { getFormattedPhoneNumber } from "@/utils/commonFUnction";
import Loader from "@/app/components/Loader";

interface ClientDetails {
  website: string;
  companyName: string;
  companyAddress: string;
  description: string;
    addressLine1: string;
  addressLine2?: string;
  state: string;
  city: string;
  zip: string;
}

interface ClientContacts {
  emailAddress: string;
  name: string;
  mobile: string | number;
}

interface EditDataType {
  id: number;
  clientDetails: ClientDetails;
  clientContacts: ClientContacts;
  isDeleted: boolean;
}

const ProfileTab = () => {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const [editData, setEditData] = useState<EditDataType | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  const fullAddress = [
  editData?.clientDetails?.addressLine1,
  editData?.clientDetails?.city,
  editData?.clientDetails?.state,
  editData?.clientDetails?.zip,
]
  .filter(Boolean)
  .join(", ");

  const formatted = getFormattedPhoneNumber(editData?.clientContacts?.mobile);
  useEffect(() => {
    const fetchEditData = async () => {
      if (id) {
        setPageLoading(true);
        try {
          const payload = {
            body: {
              id: id,
            },
          };
          const response = await api.post("/client/getClientProfile", payload);

          setEditData(response?.data?.data);
          setPageLoading(false);
        } catch (error) {
          setPageLoading(false);
          console.error("Failed to fetch edit data:", error);
        } finally {
          setPageLoading(false);
        }
      }
    };
    fetchEditData();
  }, [id]);

  return (
    <>
      {pageLoading && (
        <Loader color="primary" />
      )}
      {!pageLoading && (
        <div className="flex flex-col md:flex-row md:divide-x divide-gray-300 bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          {/* Client Contact Details */}
          <div className="p-4 flex-1">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Client Contacts
            </h5>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label
                  htmlFor="billFrom1"
                  value="Client Name"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100"
                  title={editData?.clientContacts?.name || ""}
                >
                  {editData?.clientContacts?.name || ""}
                </span>
              </div>
              <div className="flex items-center">
                <Label
                  htmlFor="billFrom2"
                  value="Email"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span 
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100" 
                  title={editData?.clientContacts?.emailAddress || ""}
                >
                  {editData?.clientContacts?.emailAddress || ""}
                </span>
              </div>
              <div className="flex items-center">
                <Label
                  htmlFor="billFrom3"
                  value="Mobile"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span 
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100"
                  title={formatted || ""}
                >
                  {formatted || ""}
                </span>
              </div>
            </div>
          </div>
          {/* Client Details */}
          <div className="p-4 flex-1">
            <h5 className="text-2xl font-bold gap-6 tracking-tight text-gray-900 dark:text-white mb-4">
              Client Details
            </h5>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label
                  htmlFor="clientDetail1"
                  value="Company Name"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span 
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100"
                  title={editData?.clientDetails?.companyName || ""}
                >
                  {editData?.clientDetails?.companyName || ""}
                </span>
              </div>
              <div className="flex items-center">
                <Label
                  htmlFor="clientDetail2"
                  value="Description"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span 
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100"
                  title={editData?.clientDetails?.description || ""}
                >
                  {editData?.clientDetails?.description || ""}
                </span>
              </div>
              <div className="flex items-center">
                <Label
                  htmlFor="clientDetail3"
                  value="Website"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span 
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100"
                  title={editData?.clientDetails?.website || ""}
                >
                  {editData?.clientDetails?.website || ""}
                </span>
              </div>
              <div className="flex items-center">
                <Label
                  htmlFor="clientDetail4"
                  value="Company Address"
                  className="w-32 text-gray-900 dark:text-gray-100"
                />
                <span className="mx-2">:</span>
                <span 
                  className="truncate max-w-[220px] whitespace-nowrap overflow-hidden text-gray-900 dark:text-gray-100"
                  title={fullAddress}
                >
                  {fullAddress}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileTab;
