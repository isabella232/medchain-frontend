import React from "react";
import Admin from "./components/Admin";
import Transactions from "./components/Transactions";
import Projects from "./components/Projects";
import Sidebar from "./components/Sidebar";
import "./tailwind.generated.css";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import NotFound from "./components/NotFound";

function App() {
  return (
    <div className="flex h-full">
      <Router>
        <Sidebar />
        <Switch>
          <Redirect exact path="/" to="/admins" />
          <Route path="/admins" component={Admin} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/projects" component={Projects} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
