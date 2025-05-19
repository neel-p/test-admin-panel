import ProfileForm from "./ProfileForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Alris Admin",
};
const Page = () => {
  return (
    <>
      <ProfileForm />
    </>
  );
};

export default Page;
