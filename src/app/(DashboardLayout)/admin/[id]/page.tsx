import ClientForm from "../Add-Client/ClientForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Client | Alris Admin",
};

const Page = ({ params }) => {
	 const { id } = params;
  return (
    <>
      <ClientForm id={id}/>
    </>
  );
};

export default Page;
