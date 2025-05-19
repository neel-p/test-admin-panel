"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { Button, TextInput, Spinner } from "flowbite-react";
import { useEffect, useMemo, useRef, useState } from "react";

import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import api from "@/utils/axios";
import { getDecryptedData } from "@/utils/secureStorage";
import { useClientStore } from "@/stores/clientStore";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useToast } from "@/app/components/toast/ToastManager";
import Loader from "@/app/components/Loader";
interface Client {
  id: number;
  name: string;
  description: string;
  isDeleted?: boolean | null;
}


const AgentListTab = () => {
  const { getClientId } = useClientStore();
  const { showToast } = useToast();
  const { handleApiResponse } = useHandleApiResponse();
  const [data, setData] = useState<Client[]>([]);
  const [agentList, setAgentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const userRole = getDecryptedData("user", "cookie")?.role?.toLowerCase();
  const [assignLoading, setAssignLoading] = useState<number | null>(null);
  const [removeLoading, setRemoveLoading] = useState<number | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const fetchUsers = async () => {
    try {
      setFetchLoading(true);
      const payload = {
        body: {
          page: 1,
          pageSize: 10,
          search,
          sortBy: "id",
          sortOrder: "desc",
          clientId: parseInt(getClientId()),
        },
      };
      const res = await api.post("/user/clientAgentList", payload);
      if (!res.data.error) {
        const newData = res?.data?.data || [];
        if (pageIndex === 1) {
          setData(newData);
        } else {
          setData(prev => [...prev, ...newData]);
        }
        // setHasMore(newData.length > 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setFetchLoading(false);
    }
	};
	

  const fetchAgent = async () => {
    if (userRole !== "admin") return;
    
    try {
      const payload = {
        body: {
          id: parseInt(getClientId()),
        },
      };
      const res = await api.post("/admin/getRefAgentList", payload);
      if (!res.data.error) {
        const agentData = res?.data?.data || [];
        setAgentList(agentData);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPageIndex(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore]);
	
  useEffect(() => {
    setPageIndex(1);
    setData([]);
    fetchUsers();
    if (userRole === "admin") {
      fetchAgent();
    }
  }, [search, nameSearch, getClientId()]);

  useEffect(() => {
      fetchUsers();
  }, []);

  useEffect(() => {
    fetchAgent();
  }, []);

	const handleAssignAgent = async (agentId: number) => {
    if (userRole !== "admin") {
      showToast("Only admin can assign agents", "error");
      return;
    }
    try {
      setAssignLoading(agentId);
      const payload = {
        body: {
          clientId: parseInt(getClientId()),
          agentId: agentId,
        },
      };
      const response = await api.post("/admin/assignAgent", payload);
      handleApiResponse(response);
      if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
		  setData([]);
		  await Promise.all([fetchUsers(), fetchAgent()]);
		  setPageIndex(1);
        setUpdateTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Network error";
      showToast(message, "error");
    } finally {
      setAssignLoading(null);
    }
  };

  const handleRemoveAssignAgent = async (ids: any) => {
    if (userRole !== "admin") {
      showToast("Only admin can remove agents", "error");
      return;
    }
    try {
      setRemoveLoading(ids);
      const payload = {
        body: {
          agentId: parseInt(ids),
          isDeleted: true,
          clientId: parseInt(getClientId()),
        },
      };
      const response = await api.post("/client/removeAssignAgent", payload);
      handleApiResponse(response);
      if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
		  setData([]);
		  await Promise.all([fetchUsers(), fetchAgent()]);
		  setPageIndex(1);
        setUpdateTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Network error";
      showToast(message, "error");
    } finally {
      setRemoveLoading(null);
    }
  };

  const displayData = useMemo(() => {
    if (userRole === "admin") {
      const assignedAgentIds = new Set(data?.map(user => user?.id));
      // Remove agents from agentList that are already in data
      const unassignedAgents = agentList?.filter(agent => !assignedAgentIds.has(agent.id));
      // Mark assigned agents
      const assignedAgents = data?.map(user => ({
        ...user,
        isAssigned: true,
      }));
      // Mark unassigned agents
      const unassignedAgentsWithFlag = unassignedAgents?.map(agent => ({
        ...agent,
        isAssigned: false,
      }));
      // Combine and sort
      return [...assignedAgents, ...unassignedAgentsWithFlag].sort((a, b) =>
        a.isAssigned === b.isAssigned
          ? a.name.localeCompare(b.name)
          : a.isAssigned
          ? -1
          : 1
      );
    } else {
      return data;
    }
  }, [data, agentList, userRole, updateTrigger, getClientId()]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };


  return (
    <>
      <div className="overflow-hidden">
        <div className="">
          <div className="mb-4 flex gap-4">
            <TextInput
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={handleSearch}
              className="w-full max-w-md"
            />
          </div>

          {fetchLoading && pageIndex === 1 ? (
           <Loader color="primary" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayData?.map((item, index) => (
                <CardBox
                  key={item.id}
                  className="relative !shadow-none rounded-lg overflow-hidden bg-light:secondary dark:bg-dark:secondary h-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <span className="w-14 h-10 rounded-full flex items-center justify-center text-white mb-8 bg-secondary">
                        <Icon icon={"solar:refresh-circle-line-duotone"} height={24} />
                      </span>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs">
                            {item.name}
                          </span>
                        </div>
                        {userRole === "admin" && (
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            item.isAssigned 
                              ? 'bg-green-100 text-primary-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {item.isAssigned ? 'Assigned' : 'Unassigned'}
                          </span>
                        )}
                      </div>
                      <p className="text-darklink text-sm mt-2 font-medium">
                        {item.description}
                      </p>
                    </div>
                    {userRole === "admin" && (
                      <div className="mt-auto pt-4">
                        {item.isAssigned ? (
                          <Button 
                            color="failure"
                            onClick={() => handleRemoveAssignAgent(item.id)}
                            disabled={removeLoading === item.id}
                            className="w-full"
                          >
                            {removeLoading === item.id ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                                Removing...
                              </div>
                            ) : (
                              'Remove Agent'
                            )}
                          </Button>
                        ) : (
                          <Button
                            color="primary"
                            onClick={() => handleAssignAgent(item.id)}
                            disabled={assignLoading === item.id}
                            className="w-full"
                          >
                            {assignLoading === item.id ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                                Assigning...
                              </div>
                            ) : (
                              'Assign Agent'
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardBox>
              ))}
            </div>
          )}

          {fetchLoading && pageIndex > 1 && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {hasMore && <div ref={lastElementRef} className="h-10" />}
        </div>
      </div>
    </>
  );
};

export default AgentListTab;
