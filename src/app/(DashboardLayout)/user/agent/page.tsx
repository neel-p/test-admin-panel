import AgentList from './AgentList'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent List | Alris Admin",
};

const Page = () => {
  return (
      <AgentList />
  );
};

export default Page;
