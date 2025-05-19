import ClientProfile from './ClientProfile'

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Profile | Alris Admin",
};

const Page = () => {
  return (
      <ClientProfile />
  );
};

export default Page;
