"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import OutlineCard from "@/app/components/shared/OutlineCard";
import ProfileTab from "./ProfileTab";
import { Button, Tabs, TabsRef } from "flowbite-react";
import Link from "next/link";

const ProfileBanner = () => {
	
  const tabsRef = useRef<TabsRef>(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <OutlineCard className="mt-[30px] shadow-none">
        <div className="flex items-center justify-between">
				  <h4 className="text-lg font-semibold">Client Details</h4>
				   <Button
            color="primary"
            href="/admin"
            as={Link}
            className="flex  items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg "
          >
          
            Back
          </Button>
        </div>

        <Tabs
          aria-label="Tabs with underline"
          variant="underline"
          ref={tabsRef}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        >
          <Tabs.Item
            active
            title="Profile"
            icon={() => <Icon icon="solar:shield-user-outline" height={20} />}
          >
            <ProfileTab />
          </Tabs.Item>
       
        </Tabs>
      </OutlineCard>
    </>
  );
};

export default ProfileBanner;
