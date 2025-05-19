
import { Metadata } from "next";
import TalentPoolList from './TalentPoolList'
export const metadata: Metadata = {
  title: "Talent Pool | Alris Admin",
};

const Page = () => {
  return (
      <TalentPoolList />
  );
};

export default Page;
