import { Metadata } from "next";
import ClientForm from "../Add-Client/ClientForm";

export const metadata: Metadata = {
  title: "Alris Admin",
};

const page = ({ params }) => {
	 const { id } = params;
  return (
    <>
      <ClientForm id={id}/>
    </>
  );
};

export default page;
