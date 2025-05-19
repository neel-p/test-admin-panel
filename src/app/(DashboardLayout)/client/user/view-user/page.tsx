

import UserProfile from './UserProfile'

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent List | Alris Admin",
};
const Page = () => {
  return (
       <UserProfile />
  );
};

export default Page;
