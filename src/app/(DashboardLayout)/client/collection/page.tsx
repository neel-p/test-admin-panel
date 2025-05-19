import CollectionListTab from './CollectionListTab'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent List | Alris Admin",
};


const Page = () => {
  return (
      <CollectionListTab />
  );
};

export default Page;
