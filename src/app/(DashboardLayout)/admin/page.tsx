
import type { NextPage } from "next";

import ClientList from './ClientList'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client List | Alris Admin",
};
const ClientListPage: NextPage = () => {
    return (
      <ClientList />
  	);
};

export default ClientListPage;
