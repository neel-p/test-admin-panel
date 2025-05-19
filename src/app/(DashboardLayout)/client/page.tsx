import { Metadata } from "next";
import UserList from './UserList'

export const metadata: Metadata = {
  title: "User List | Alris Admin",
};
const Page =  () => {
  return (
      <UserList />
  );
};

export default Page;
