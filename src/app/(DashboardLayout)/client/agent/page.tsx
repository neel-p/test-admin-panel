// Lazy load the ClientForm component
import AgentListTab from "./AgentListTab"

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent List | Alris Admin",
};


const Page = () => {
  return (
      <AgentListTab/>
  );
};

export default Page;
