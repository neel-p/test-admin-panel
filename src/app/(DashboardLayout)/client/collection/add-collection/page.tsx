import CollectionForm from './CollectionForm'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Collection | Alris Admin",
};
const Page = () => {
  return (
      <CollectionForm />
  );
};

export default Page;
