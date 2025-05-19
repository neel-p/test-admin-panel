
import TaskList from './TaskList'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task List | Alris Admin",
};

const Page = () => {
return (   
      <TaskList />
  );
};

export default Page;
