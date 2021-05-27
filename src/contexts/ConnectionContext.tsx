import React, { createContext, FunctionComponent, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export type ConnectionType = {
  connected: boolean;
  public: string;
  private: string;
};
export type ConnectionContextType = {
  connection: ConnectionType;
  setConnection: (name: ConnectionType) => void;
};

const ConnectionDefaultValues:ConnectionContextType = {
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

const ConnectedContextProvider: FunctionComponent<{ children: any }> = ({
  children,
}) => {
  const [connection, setConnection] = useLocalStorage('medchain-keys',
    ConnectionDefaultValues.connection
  );

  return (
    <ConnectionContext.Provider value={{ connection, setConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectedContextProvider;
