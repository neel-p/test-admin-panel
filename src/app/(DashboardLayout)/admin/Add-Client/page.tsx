
import ClientForm from './ClientForm'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Client | Alris Admin",
};

const Page = () => {
  return (
      <ClientForm />
  );
};

export default Page;
