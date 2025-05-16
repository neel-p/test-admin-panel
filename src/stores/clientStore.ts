// stores/clientStore.ts
import { getDecryptedData, setEncryptedData } from "@/utils/secureStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Client = {
  id: any;
  role?: string;
  clientId?: string;
  [key: string]: any;
};

// Define Zustand store state and actions
interface ClientStore {
  selectedClient?: Client | null;
	clientList: Client[];
	setSelectClientValues: any
	selectClientValues: any
  updateClient: (client: Client) => void;
  setClientList: (clients: Client[]) => void;
  loadClientFromStorage: () => void;
  getClientId: () => string | undefined | any;
  updatedNewData: any
  setUpdatedNewData: any
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      selectedClient: getDecryptedData("selectClient", "localStorage") || null,
      clientList: [],
	  selectClientValues: {},
	  updatedNewData: false,
      
      updateClient: (client) => {
        if (!client) return;
        setEncryptedData("selectClient", client, "localStorage", 480);
        set({ selectedClient: client });
      },

	    setUpdatedNewData: (clients) => {
        set({ selectClientValues: clients });
      },
	  
      setSelectClientValues: (clients) => {
        set({ selectClientValues: clients });
      },

      setClientList: (clients) => {
        set({ clientList: clients });
      },

      loadClientFromStorage: () => {
        const client = getDecryptedData("selectClient", "localStorage");
        set({ selectedClient: client || null });
      },

      getClientId: () => {
        const client = get().selectedClient;
        if (!client) return undefined;

        try {
          if (client?.role?.toLowerCase() === 'client' || client?.role?.toLowerCase() === 'user') {
            return client.clientId;
          }
          return client.id;
        } catch (error) {
          console.error('Error in getClientId:', error);
          return undefined;
        }
      }
    }),
    {
      name: 'client-storage', // unique name for localStorage
      partialize: (state) => ({ 
        selectedClient: state.selectedClient,
        clientList: state.clientList,
		selectClientValues: state.selectClientValues,
		updatedNewData: state.updatedNewData
      }),
    }
  )
);
