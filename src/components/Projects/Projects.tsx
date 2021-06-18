import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { GoProject } from "react-icons/go";
import classes from "../../classes/classes";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { queries } from "../../services/byprosQueries";
import { byprosQuery, getProject } from "../../services/cothorityGateway";
import { ProjectDetails } from "../../services/CothorityTypes";
import { hex2Bytes } from "../../services/cothorityUtils";
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
  selectedProject: ProjectDetails;
  setSelectedProject: React.Dispatch<
    React.SetStateAction<ProjectDetails | undefined>
  >;
  success: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ selectedProject, setSelectedProject, setSuccess }) => {
  const [showNewUser, setShowNewUser] = useState(false);
  const { connection } = useContext(ConnectionContext);

  return (
    <div className={classnames(classes.box)}>
      <PanelElement title="Project instance ID">
        {selectedProject.instanceid}
        <CopyButton elem={selectedProject.instanceid} />
      </PanelElement>
      <PanelElement title="Project Name">
        {selectedProject.project.name}
      </PanelElement>
      <PanelElement title="Project Description">
        {selectedProject.project.description}
      </PanelElement>
      <PanelElement title="Add a New User" last>
        {showNewUser ? (
          <AddUser
            setShowNewUser={setShowNewUser}
            setSuccess={setSuccess}
            instanceId={hex2Bytes(selectedProject.instanceid)}
          />
        ) : (
          <AddButton onClick={() => setShowNewUser(true)} />
        )}
      </PanelElement>
      {selectedProject.project.authorizations && (
        <PanelElement title="Users" last>
          <UserTable
            connection={connection}
            setSuccess={setSuccess}
            selectedProject={selectedProject}
          />
        </PanelElement>
      )}
    </div>
  );
};

const Projects: FunctionComponent = () => {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [success, setSuccess] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetails | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const { connection } = useContext(ConnectionContext);
  useEffect(() => {
    const queryReplies = async () => {
      const queryResults = await byprosQuery(queries.projects);
      const results: Promise<ProjectDetails>[] = queryResults.map(
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
          <div className="space-y-4">
            {loading ? (
              <Spinner />
            ) : (
              <ProjectsPager
                data={projects as ProjectDetails[]}
                selectedProject={selectedProject!}
                setSelectedProject={setSelectedProject}
              />
            )}
            <PanelElement title="Add a New Project" last>
              <NewProject setSuccess={setSuccess} connection={connection} />
            </PanelElement>
          </div>
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
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
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
