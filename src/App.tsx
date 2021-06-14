import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import Admin from "./components/Administration/Admin";
import Projects from "./components/Projects/Projects";
import Sidebar from "./components/Sidebar";
import Transactions from "./components/Transactions/Transactions";
import ConnectedContextProvider from "./contexts/ConnectionContext";
import "./tailwind.generated.css";

function App() {
  return (
    <div className="flex h-full">
      <ConnectedContextProvider>
        <Router>
          <Sidebar />
          <Switch>
            <Redirect exact path="/" to="/admins" />
            <Route path="/admins" component={Admin} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/projects" component={Projects} />
            <Route component={Admin} />
          </Switch>
        </Router>
      </ConnectedContextProvider>
    </div>
  );
}

export default App;
