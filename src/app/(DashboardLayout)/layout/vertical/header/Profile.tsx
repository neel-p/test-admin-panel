import * as profileData from "./Data";

import { Button, Dropdown } from "flowbite-react";
import { getDecryptedData, removeStorage } from "@/utils/secureStorage";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SimpleBar from "simplebar-react";
import { useRouter } from "next/navigation";

const Profile = () => {
	const router = useRouter();
  const localData = getDecryptedData("user", "cookie");
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] py-6  rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src="/images/profile/user-1.jpg"
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <div className="px-6">
          <h3 className="text-lg font-semibold text-ld">User Profile</h3>
          <div className="flex items-center gap-6 pb-5 border-b dark:border-darkborder mt-5 mb-3 img80">
            <Image
              src="/images/profile/user-1.jpg"
              alt="logo"
              height="80"
              width="80"
              className="rounded-full"
            />
            <div>
              <h5 className="card-title">{localData?.role.toLowerCase() === "admin" ? `${localData?.firstName} ${localData?.lastName}` : localData?.role.toLowerCase() === "client"  ? localData?.clientContacts?.name: `${localData?.firstName} ${localData?.lastName}`}</h5>
              <span className="card-subtitle">{localData?.role}</span>
              <p className="card-subtitle mb-0 mt-1 flex items-center">
                <Icon
                  icon="solar:mailbox-line-duotone"
                  className="text-base me-1"
                />
                {localData?.email || localData?.clientContacts?.emailAddress}
              </p>
            </div>
          </div>
        </div>
        <SimpleBar>
        {localData?.role.toLowerCase() !== "admin" ? (
        profileData.profileDD.map((items, index) => (
          <Dropdown.Item
            as={Link}
            href={localData?.role.toLowerCase() === "client" ? '/profile' : "/user-profile"}
            className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full"
            key={index}
          >
            <div className="flex items-center w-full">
              <div
                className={`h-11 w-11 flex-shrink-0 rounded-md flex justify-center items-center ${items.bgcolor}`}
              >
                <Icon icon={items.icon} height={20} className={items.color} />
              </div>
              <div className="ps-4 flex justify-between w-full">
                <div className="w-3/4">
                  <h5 className="mb-1 text-sm group-hover/link:text-primary">
                    {items.title}
                  </h5>
                  <div className="text-xs text-darklink">{items.subtitle}</div>
                </div>
              </div>
            </div>
          </Dropdown.Item>
        ))
        ) : (
        	null
        )}
        </SimpleBar>

        <div className="pt-6 px-6">
          <Button
            color={"primary"}
            className="w-full"
						onClick={() => {
							 removeStorage();
							  router.push('/auth/login')
						}}
          >
            Logout
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
