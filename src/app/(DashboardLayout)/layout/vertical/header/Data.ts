

//Apps Links Type & Data
interface appsLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const appsLink: appsLinkType[] = [
];

interface LinkType {
  href: string;
  title: string;
}

const pageLinks: LinkType[] = [
];

//   Search Data
interface SearchType {
  href: string;
  title: string;
}

const SearchLinks: SearchType[] = [
];

//   Message Data
interface MessageType {
  title: string;
  avatar: any;
  subtitle: string;
  color: string;
  time: string;
}

import avatar1 from "/public/images/profile/user-6.jpg";
import avatar2 from "/public/images/profile/user-2.jpg";
import avatar3 from "/public/images/profile/user-3.jpg";
import avatar4 from "/public/images/profile/user-4.jpg";
import avatar5 from "/public/images/profile/user-5.jpg";

const MessagesLink: MessageType[] = [
];

//   Notification Data
interface NotificationType {
  title: string;
  icon: any;
  subtitle: string;
  bgcolor: string;
  color:string;
  time: string;
}

const Notification: NotificationType[] = [

];

//  Profile Data
interface ProfileType {
  title: string;
  icon: any;
  subtitle: string;
  color: string;
  bgcolor: string;
  url: string;
}

const profileDD: ProfileType[] = [
  {
    icon: "solar:wallet-2-line-duotone",
    bgcolor: "bg-lightprimary dark:bg-lightprimary",
    color: "text-primary",
    title: "My Profile",
    subtitle: "Account settings",
    url: "/profile",
  },
  
];

export {
  appsLink,
  pageLinks,
  SearchLinks,
  MessagesLink,
  Notification,
  profileDD,
};
