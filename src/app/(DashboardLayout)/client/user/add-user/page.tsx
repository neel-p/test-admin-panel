import UserForm from './UserForm'

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create User | Alris Admin",
};
const Page = () => {
  return (  
      <UserForm />
  );
};

export default Page;
