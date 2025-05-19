import UserProfileForm from "./UserProfileForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Alris Admin",
};
const Page = () => {
  return (
    <>
      <UserProfileForm />
    </>
  );
};

export default Page;
