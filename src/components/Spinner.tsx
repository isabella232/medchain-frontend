import React, { FunctionComponent } from "react";
import {VscLoading} from 'react-icons/vsc'

const Spinner: FunctionComponent = () => {
  return <VscLoading className="animate-spin text-primary-400" size={"1.5rem"}/>;
};

export default Spinner;
