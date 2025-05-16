import { uniqueId } from "lodash";

const Menuitems = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: "solar:layers-line-duotone",
    href: "",
    column:1,
    children: [
      {
        id: uniqueId(),
        title: "User List",
        icon: "solar:home-angle-outline",
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Category List",
        icon: "solar:settings-minimalistic-line-duotone",
        href: "/categoryList",
      },
    ],
  },

];
export default Menuitems;
