import { Metadata } from "next";
import TaskList from './TaskList'
export const metadata: Metadata = {
  title: "Task List | Alris Admin",
};


const Page = () => {
  return (
      <TaskList />
  );
};

export default Page;
