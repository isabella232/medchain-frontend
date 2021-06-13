import { createContext, FunctionComponent } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
/**
 * Context used to store the public and private keys. 
 * The Connection object is available to all components
 * that are children of the Connection context
 */
export type ConnectionType = {
  connected: boolean;
  public: string;
  private: string;
};
export type ConnectionContextType = {
  connection: ConnectionType;
  setConnection: (name: ConnectionType) => void;
};

const ConnectionDefaultValues: ConnectionContextType = {
  connection: {
    connected: false,
    public: "",
    private: "",
  },
  setConnection: () => {},
};

export const ConnectionContext = createContext<ConnectionContextType>(
  ConnectionDefaultValues
);
/**
 * The connection object containing the public and private keys as stored in Local storage
 */
const ConnectedContextProvider: FunctionComponent<{ children: any }> = ({
  children,
}) => {
  const [connection, setConnection] = useLocalStorage(
    "medchain-keys",
    ConnectionDefaultValues.connection
  );
  return (
    <ConnectionContext.Provider value={{ connection, setConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectedContextProvider;
