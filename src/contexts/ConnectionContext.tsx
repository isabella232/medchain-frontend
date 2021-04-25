import React, { createContext, FunctionComponent, useState } from "react";

export type ConnectionType = {
  connected: boolean;
  public: string;
  private: string;
};
export type ConnectionContextType = {
  connection: ConnectionType;
  setConnection: (name: ConnectionType) => void;
};

const ConnectionDefaultValues = {
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
  const [connection, setConnection] = useState(
    ConnectionDefaultValues.connection
  );

  return (
    <ConnectionContext.Provider value={{ connection, setConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectedContextProvider;
