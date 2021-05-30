import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { GoProject } from "react-icons/go";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { byprosQuery, getProject } from "../services/cothorityGateway";
import { ProjectContract } from "../services/messages";
import { CopyButton } from "./Buttons";
import PageLayout from "./PageLayout";
import { ProjectsPager } from "./Pager";
import PanelElement from "./PanelElement";

const SelectedProject: FunctionComponent<{
  selectedTransaction: any;
  setSelectedTransaction: any;
  success: any;
  setSuccess: any;
}> = ({ selectedTransaction, setSelectedTransaction, success, setSuccess }) => {
  const [executed, setExecuted] = useState<boolean>(false);
  const { connection } = useContext(ConnectionContext);
  const [error, setError] = useState("");

  useEffect(() => {
   
  }, [selectedTransaction]);
  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
       <PanelElement title="Transaction instance ID">
        {selectedTransaction.instanceid}
        <CopyButton elem={selectedTransaction.instanceid} />
      </PanelElement>
       <PanelElement title="Project Name">
        {selectedTransaction.project.name}
      </PanelElement>
       <PanelElement title="Project Description">
        {selectedTransaction.project.name}
      </PanelElement>
    </div>
  );
};

const Projects: FunctionComponent = () => {
  const [projects, setProjects] = useState<ProjectContract[]>([]);
  const [success, setSuccess] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>();
  useEffect(() => {
    var t0 = performance.now();
    const queryReplies = async () => {
      const queryResults = await byprosQuery(`SELECT 
    encode(cothority.instruction.contract_iid,'hex') as instanceid
  FROM
    cothority.instruction
  INNER JOIN 
    cothority.transaction 
  ON
    cothority.transaction.transaction_id = cothority.instruction.transaction_id
  WHERE
    cothority.instruction.type_id = 2
  AND 
    cothority.instruction.contract_name = 'project'
  AND 
    cothority.transaction.Accepted = TRUE`);
      const results: Promise<ProjectContract>[] = queryResults.map(
        (result: { instanceid: string }) => {
          return getProject(result.instanceid);
        }
      );
      return results;
    };
    queryReplies().then((result) => {
      Promise.all(result).then((res) => {
        setProjects(res);
        console.log(res);
        var t1 = performance.now();
        console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
      });
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
          <ProjectsPager
            data={projects as any}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
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
    </PageLayout>
  );
};

export default Projects;
