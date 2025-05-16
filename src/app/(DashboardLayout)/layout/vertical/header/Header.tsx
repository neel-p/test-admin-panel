"use client";
import { CustomizerContext } from "@/app/context/customizerContext";
import { Icon } from "@iconify/react";
import "flowbite";
import { Navbar, Tooltip , Drawer} from "flowbite-react";
import Select from "react-select";
import { useContext, useEffect, useState } from "react";
import { setEncryptedData } from "@/utils/secureStorage";
import Profile from "./Profile";
import Search from "./Search";
import api from "@/utils/axios";
import HorizontalMenu from "../../horizontal/header/HorizontalMenu";
import FullLogo from "../../shared/logo/FullLogo";
import MobileSidebar from "../sidebar/MobileSidebar";
import MobileHeaderItems from "./MobileHeaderItems";
import { useClientStore } from "@/stores/clientStore";
import { getDecryptedData } from "@/utils/secureStorage";
import { usePathname , useRouter} from 'next/navigation'
interface HeaderPropsType {
  layoutType: string;
}

const Header = ({ layoutType }: HeaderPropsType) => {
  const pathname: any = usePathname();
  const router = useRouter();
	const userData = getDecryptedData("user", "cookie");
  const [isSticky, setIsSticky] = useState(false);
  const { updateClient, clientList, setClientList , setSelectClientValues, selectClientValues, updatedNewData} = useClientStore();


	useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

	
  const handleSelectClient = async (value) => {
    const selectedClient = clientList.find(c => parseInt(c.id) === parseInt(value));
    await updateClient(selectedClient);
    // Get current path
    const allowedPaths = ['/admin', '/client/user', '/client/collection', '/client/agent', '/talent-pool'];
    
    // Check if current path is not in allowed paths
    if (!allowedPaths?.includes(pathname)) {
      // Use router to go back
      router.back();
    }
  }
  
  const fetchUsers = async () => {
		try {
			const payload = {
				body: {
					page: 1,
					pageSize: 100,
					search:"",
					sortBy:"id",
					sortOrder:"desc"
				},
			};
			const res = await api.post("/admin/getAllClientList", payload);
			if (!res.data.error) {
				setClientList(res?.data?.data);
			}
		} catch (error) {
			console.error("Failed to fetch edit data:", error);
		} finally {
		}
	};
	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		if(updatedNewData) fetchUsers();
	}, [updatedNewData]);


  const { setIsCollapse, isCollapse, isLayout, setActiveMode, activeMode } =
    useContext(CustomizerContext);

  const [mobileMenu, setMobileMenu] = useState("");

  const handleMobileMenu = () => {
    if (mobileMenu === "active") {
      setMobileMenu("");
    } else {
      setMobileMenu("active");
    }
  };

  const toggleMode = () => {
    setActiveMode((prevMode: string) =>
      prevMode === "light" ? "dark" : "light"
    );
  };

  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <header
        className={`sticky top-0 z-[5] ${
          isSticky
            ? "bg-lightgray dark:bg-dark shadow-md fixed w-full"
            : "bg-transparent"
        }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-30 px-4 ${
            layoutType == "horizontal" ? "container mx-auto" : ""
          }  ${isLayout == "full" ? "!max-w-full" : ""}`}
        >
          {/* Mobile Toggle Icon */}
          <span
            onClick={() => setIsOpen(true)}
            className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
          >
            <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
          </span>
          {/* Toggle Icon   */}
          <Navbar.Collapse className="xl:block ">
            <div className="flex gap-3 items-center relative">
              {layoutType == "horizontal" ? (
                <div className="me-3">
                  <FullLogo />
                </div>
              ) : null}
              {/* Toggle Menu    */}
              {layoutType != "horizontal" ? (
                <span
                  onClick={() => {
                    if (isCollapse === "full-sidebar") {
                      setIsCollapse("mini-sidebar");
                    } else {
                      setIsCollapse("full-sidebar");
                    }
                  }}
                  className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer"
                >
                  <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
                </span>
              ) : null}

              {/* <Search /> */}
            </div>
          </Navbar.Collapse>

          {/* mobile-logo */}
          <div className="block xl:hidden">
            <FullLogo />
          </div>

		  

          <Navbar.Collapse className="xl:block hidden">
              {userData?.role?.toLowerCase() === "admin" && !pathname.includes('admin/role-permission') && !pathname.includes('admin') ? (
                <div className="w-[300px]"> {/* Fixed width of 300px */}
                  <Select
                    id="client-select"
                    className="w-full"
                    onChange={(option: any) => {setSelectClientValues(option);handleSelectClient(option.value)}}
                    options={clientList?.map(ele => ({
                      value: ele.id,
                      label: ele.clientContacts.name
                    }))}
                    placeholder="Select a client"
                    isSearchable={true}
					value={selectClientValues}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        height: '42px',
                        width: '300px',
                        borderRadius: '0.5rem',
                        backgroundColor: activeMode === 'dark' ? 'rgb(55 65 81)' : 'rgb(249 250 251)',
                        borderColor: state.isFocused 
                          ? activeMode === 'dark' ? 'rgb(59 130 246)' : 'rgb(59 130 246)'
                          : activeMode === 'dark' ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
                        boxShadow: state.isFocused ? '0 0 0 1px rgb(59 130 246)' : 'none',
                        '&:hover': {
                          borderColor: activeMode === 'dark' ? 'rgb(59 130 246)' : 'rgb(59 130 246)'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        padding: '8px 12px',
                        backgroundColor: activeMode === 'dark'
                          ? state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)'
                          : state.isFocused ? 'rgb(243 244 246)' : 'white',
                        color: activeMode === 'dark' ? 'rgb(249 250 251)' : 'rgb(17 24 39)',
                        cursor: 'pointer',
                        '&:active': {
                          backgroundColor: activeMode === 'dark' ? 'rgb(75 85 99)' : 'rgb(229 231 235)'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        width: '300px',
                        backgroundColor: activeMode === 'dark' ? 'rgb(31 41 55)' : 'white',
                        borderRadius: '0.5rem',
                        marginTop: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: activeMode === 'dark' ? 'rgb(249 250 251)' : 'rgb(17 24 39)',
                      }),
                      input: (base) => ({
                        ...base,
                        color: activeMode === 'dark' ? 'rgb(249 250 251)' : 'rgb(17 24 39)',
                        '& input': {
                          outline: 'none !important',
                          border: 'none !important',
                          boxShadow: 'none !important'
                        }
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: '8px',
                        color: activeMode === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
                        '&:hover': {
                          color: activeMode === 'dark' ? 'rgb(209 213 219)' : 'rgb(55 65 81)'
                        }
                      })
                    }}
                  />
                </div>
              ) : null}
            <div className="flex gap-3 items-center">

              {/* Theme Toggle */}
              {activeMode === "light" ? (
                <Tooltip content="Switch to Dark Mode">
                  <div
                    className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar  dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-darklink  dark:text-white"
                    onClick={toggleMode}
                  >
                    <span className="flex items-center">
                      <Icon icon="solar:moon-line-duotone" width="20" />
                    </span>
                  </div>
                </Tooltip>
              ) : (
                // Dark Mode Button
                <Tooltip content="Switch to Light Mode">
                  <div
                    className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar  dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-darklink  dark:text-white"
                    onClick={toggleMode}
                  >
                    <span className="flex items-center">
                      <Icon icon="solar:sun-bold-duotone" width="20" />
                    </span>
                  </div>
                </Tooltip>
              )}

              {/* Messages Dropdown */}
              {/* <Messages /> */}

					
              {/* Notification Dropdown */}
              {/* <Notifications /> */}

              {/* Profile Dropdown */}
              <Profile />
            </div>
          </Navbar.Collapse>
          {/* Mobile Toggle Icon */}
          <span
            className="h-10 w-10 flex xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
            onClick={handleMobileMenu}
          >
            <Icon icon="tabler:dots" height={21} />
          </span>
        </Navbar>
        <div
          className={`w-full  xl:hidden block mobile-header-menu ${mobileMenu}`}
        >
          <MobileHeaderItems />
        </div>

        {/* Horizontal Menu  */}
        {layoutType == "horizontal" ? (
          <div className="xl:border-y xl:border-ld">
            <div
              className={`${isLayout == "full" ? "w-full px-6" : "container"}`}
            >
              <HorizontalMenu />
            </div>
          </div>
        ) : null}
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;
