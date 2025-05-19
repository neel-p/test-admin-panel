import DocumentForm from './DocumentForm'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Document | Alris Admin",
};

const page = () => {
  return (
      <DocumentForm />
  );
};

export default page;
