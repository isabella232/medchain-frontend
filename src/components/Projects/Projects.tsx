import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { GoProject } from "react-icons/go";
import classes from "../../classes/classes";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { queries } from "../../services/byprosQueries";
import { byprosQuery, getProject } from "../../services/cothorityGateway";
import { hex2Bytes } from "../../services/cothorityUtils";
import { ProjectContract } from "../../services/messages";
import { AddButton, CopyButton } from "../Buttons";
import PageLayout from "../PageLayout";
import { ProjectsPager } from "../Pager";
import PanelElement from "../PanelElement";
import Spinner from "../Spinner";
import Success from "../Success";
import AddUser from "./AddUser";
import NewProject from "./NewProject";
import UserTable from "./userTable";

const SelectedProject: FunctionComponent<{
  selectedTransaction: any;
  setSelectedTransaction: any;
  success: any;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ selectedTransaction, setSuccess }) => {
  const [showNewUser, setShowNewUser] = useState(false);
  const { connection } = useContext(ConnectionContext);

  useEffect(() => {}, [selectedTransaction]);
  return (
    <div className={classnames(classes.box)}>
      <PanelElement title="Transaction instance ID">
        {selectedTransaction.instanceid}
        <CopyButton elem={selectedTransaction.instanceid} />
      </PanelElement>
      <PanelElement title="Project Name">
        {selectedTransaction.project.name}
      </PanelElement>
      <PanelElement title="Project Description">
        {selectedTransaction.project.description}
      </PanelElement>
      <PanelElement title="Add a New User" last>
        {showNewUser ? (
          <AddUser
            setShowNewUser={setShowNewUser}
            setSuccess={setSuccess}
            instanceId={hex2Bytes(selectedTransaction.instanceid)}
          />
        ) : (
          <AddButton onClick={() => setShowNewUser(true)} />
        )}
      </PanelElement>
      {selectedTransaction.project.authorizations && (
        <PanelElement title="Users" last>
          <UserTable
            connection={connection}
            setSuccess={setSuccess}
            selectedTransaction={selectedTransaction}
          />
        </PanelElement>
      )}
    </div>
  );
};

const Projects: FunctionComponent = () => {
  const [projects, setProjects] = useState<ProjectContract[]>([]);
  const [success, setSuccess] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const { connection } = useContext(ConnectionContext);
  useEffect(() => {
    var t0 = performance.now();
    const queryReplies = async () => {
      const queryResults = await byprosQuery(queries.projects);
      const results: Promise<ProjectContract>[] = queryResults.map(
        (result: { instanceid: string }) => {
          return getProject(result.instanceid);
        }
      );
      return results;
    };
    queryReplies().then((result) => {
      Promise.all(result)
        .then((res) => {
          setProjects(res);
          console.log(res);
          var t1 = performance.now();
          console.log(
            "Call to doSomething took " + (t1 - t0) + " milliseconds."
          );
          setLoading(false);
        })
        .catch((err) => console.log(err));
    });
  }, []);

  return (
    <PageLayout title="Projects" icon={GoProject}>
      <div className="flex">
        <div className="w-1/3 p-3">
          <h2
            className={classnames(
              "text-sm uppercase font-bold tracking-widest text-gray-700 mb-4 text-center"
            )}
          >
            Projects
          </h2>
          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              <ProjectsPager
                data={projects as any}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
              />
              <PanelElement title="Add a New Project" last>
                <NewProject setSuccess={setSuccess} connection={connection} />
              </PanelElement>
            </div>
          )}
        </div>
        <div className="w-2/3 p-3">
          <h2
            className={classnames(
              "text-sm uppercase font-bold tracking-widest text-gray-700 mb-4 text-center"
            )}
          >
            Selected Project
          </h2>
          {selectedProject !== undefined && (
            <SelectedProject
              selectedTransaction={selectedProject}
              setSelectedTransaction={setSelectedProject}
              success={success}
              setSuccess={setSuccess}
            />
          )}
        </div>
      </div>
      <Success
        success={success}
        setSuccess={setSuccess}
        title="Transaction submitted"
      />
    </PageLayout>
  );
};

export default Projects;
