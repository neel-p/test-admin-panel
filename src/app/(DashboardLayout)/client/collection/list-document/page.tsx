import { Metadata } from "next";
import DocumentList from './DocumentList'
export const metadata: Metadata = {
  title: "Document List | Alris Admin",
};

const Page = () => {
  return (
      <DocumentList />
  );
};

export default Page;
