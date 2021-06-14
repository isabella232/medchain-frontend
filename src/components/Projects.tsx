import classnames from "classnames";
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {queries} from '../services/byprosQueries'
import { AiFillMinusCircle } from "react-icons/ai";
import { FaSearch, FaSortDown, FaSortUp } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { GoProject } from "react-icons/go";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { useExpanded, useFilters, useSortBy, useTable } from "react-table";
import {
  ConnectionContext,
  ConnectionType
} from "../contexts/ConnectionContext";
import {
  byprosQuery,
  getProject,
  sendTransaction
} from "../services/cothorityGateway";
import { hex2Bytes } from "../services/cothorityUtils";
import {
  addUserRightsToProject,
  removeUserRightFromProject,
  spawnProject
} from "../services/instructionBuilder";
import { Authorization, ProjectContract } from "../services/messages";
import { AddButton, CopyButton } from "./Buttons";
import Error from "./Error";
import PageLayout from "./PageLayout";
import { ProjectsPager } from "./Pager";
import PanelElement from "./PanelElement";
import Spinner from "./Spinner";
import Success from "./Success";

/**
 * Display the input to add a new administrator key in the consortium
 */
const NewProject: FunctionComponent<{
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  connection: ConnectionType;
}> = ({ setSuccess, connection }) => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const abort = () => {
    setShowNewProject(false);
    setError("");
    setDescription("");
    setName("");
  };

  const confirm = () => {
    // TODO add user rights checks
    setError("");
    const tx = spawnProject(name, description);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
        console.log(res)
      })
      .catch((err) => console.log(err));
  };

  return showNewProject ? (
    <div>
      <div className="flex items-end space-x-2">
        <div className="space-y-1 flex-grow">
          <div>
            <label className="text-xs ml-1 mb-1">Project Name:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs ml-1 mb-1">Project Description:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <Error
              message={error}
              reset={setError}
              title="Transaction failed"
            />
          )}
        </div>
        <div className="space-x-2">
          <button className={classnames("text-green-400")} onClick={confirm}>
            <GiConfirmed />
          </button>
          <button className={classnames("text-red-400")} onClick={abort}>
            <MdCancel />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <AddButton onClick={(e) => setShowNewProject(true)} />
  );
};

/**
 * Display the input to add a new administrator key in the consortium
 */
const NewAccessRight: FunctionComponent<{
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  userId: string;
  authorization: Authorization;
  instanceId: Buffer;
}> = ({ setSuccess, userId, authorization, instanceId }) => {
  const [showNewAccessRight, setShowNewAccessRight] = useState(false);
  const [NewAccessRight, setNewAccessRight] = useState("");
  const [error, setError] = useState("");
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setNewAccessRight("");
    setError("");
    setShowNewAccessRight(false);
  };

  const confirm = () => {
    // TODO add user rights checks
    setError("");
    const tx = addUserRightsToProject(userId, NewAccessRight, instanceId);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return showNewAccessRight ? (
    <>
      {" "}
      <div className="space-y-1">
        <label className="text-xs ml-1 mb-1">New Access Right:</label>
        <div className="flex space-x-2">
          <input
            name="field_name"
            className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
            type="text"
            placeholder="count_per_site_obsfucated..."
            value={NewAccessRight}
            onChange={(e) => setNewAccessRight(e.target.value)}
          />
          <button className={classnames("text-green-400")} onClick={confirm}>
            <GiConfirmed />
          </button>
          <button className={classnames("text-red-400")} onClick={abort}>
            <MdCancel />
          </button>
        </div>
        {error && (
          <Error message={error} reset={setError} title="Transaction failed" />
        )}
      </div>
    </>
  ) : (
    <AddButton onClick={(e) => setShowNewAccessRight(true)} />
  );
};

const AccessRight: FunctionComponent<{
  action: string;
  userId: string;
  instanceId: Buffer;
  connection: ConnectionType;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setSuccess, connection, action, userId, instanceId }) => {
  const removeAccessRight = () => {
    const tx = removeUserRightFromProject(userId, action, instanceId);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex space-x-2">
      <p className="">{action}</p>
      <button className={classnames("text-red-400")}>
        <AiFillMinusCircle onClick={removeAccessRight} />
      </button>
    </div>
  );
};

const UserRights: FunctionComponent<{
  authorization: Authorization;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  instanceId: Buffer;
  connection: ConnectionType;
}> = ({ authorization, setSuccess, connection, instanceId }) => {
  return (
    <div className="px-4">
      <PanelElement title="User ID">
        {authorization.userid} <CopyButton elem={authorization.userid} />
      </PanelElement>
      {authorization.queryterms && (
        <PanelElement last title="User Rights">
          {authorization.queryterms.map((term) => {
            return (
              <AccessRight
                action={term}
                setSuccess={setSuccess}
                userId={authorization.userid}
                instanceId={instanceId}
                connection={connection}
              />
            );
          })}
        </PanelElement>
      )}
       <PanelElement last title="Add Access Rights">
      <NewAccessRight
            setSuccess={setSuccess}
            userId={authorization.userid}
            authorization={authorization}
            instanceId={instanceId}
          />
       </PanelElement>
    </div>
  );
};

const AddUser: FunctionComponent<{
  setShowNewUser: React.Dispatch<React.SetStateAction<boolean>>;
  instanceId: Buffer;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setShowNewUser, setSuccess, instanceId }) => {
  const [userId, setUserId] = useState("");
  const [accessRight, setAccesRight] = useState("");
  const [error, setError] = useState("");
  const { connection } = useContext(ConnectionContext);
  const [addUserModalIsOpen, setAddUserModalIsOpen] = useState(false);

  const abort = () => {
    setUserId("");
    setAccesRight("");
    setError("");
    setShowNewUser(false);
  };
  const confirm = () => {
    setError("");
    const tx = addUserRightsToProject(userId, accessRight, instanceId);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <div className="flex items-end space-x-2">
        <div className="space-y-1 flex-grow">
          <div>
            <label className="text-xs ml-1 mb-1">New User:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs ml-1 mb-1">New User:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="count_per_site_obsfucated"
                value={accessRight}
                onChange={(e) => setAccesRight(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <Error
              message={error}
              reset={setError}
              title="Transaction failed"
            />
          )}
        </div>
        <div className="space-x-2">
          <button className={classnames("text-green-400")} onClick={confirm}>
            <GiConfirmed />
          </button>
          <button className={classnames("text-red-400")} onClick={abort}>
            <MdCancel />
          </button>
        </div>
      </div>
    </div>
  );
};

const SelectedProject: FunctionComponent<{
  selectedTransaction: any;
  setSelectedTransaction: any;
  success: any;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ selectedTransaction, setSelectedTransaction, success, setSuccess }) => {
  const [showNewUser, setShowNewUser] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: () => null,
        id: "expander", // 'id' is required
        Cell: ({ row }: { row: any }) => (
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? (
              <IoMdArrowDropdown size="1rem" />
            ) : (
              <IoMdArrowDropright size="1rem" />
            )}
          </span>
        ),
      },
      {
        Header: "Username",
        accessor: "userid",
      },
      {
        Header: "Access Rights",
        accessor: "queryterms",
        Cell: ({ value }: { value?: any }) => {
          if (value) {return value.length} else return 0
        },
      },
    ],
    []
  );

  const data = useMemo(
    () => selectedTransaction.project.authorizations || [],
    [selectedTransaction]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
    visibleColumns, // Prepare the row (this function needs to be called for each row before getting the row props)
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useSortBy,
    useExpanded
  );

  const { connection } = useContext(ConnectionContext);
  const [error, setError] = useState("");
  const [filterInput, setFilterInput] = useState("");

  const handleFilterChange = (e: any) => {
    const value = e.target.value || undefined;
    setFilter("userid", value);
    setFilterInput(value);
  };

  useEffect(() => {}, [selectedTransaction]);
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
        {selectedTransaction.project.description}
      </PanelElement>
      <PanelElement title="Add a New User" last>
      {showNewUser ? (
            <AddUser
              setShowNewUser={setShowNewUser}
              setSuccess={setSuccess}
              instanceId={hex2Bytes(selectedTransaction.instanceid)}
            />
          ) : <AddButton onClick={() => setShowNewUser(true)} />}
      </PanelElement>
      {selectedTransaction.project.authorizations && (
        <PanelElement title="Users" last>
            <>
              <div className="flex">
                <div className="inline-flex items-center p-2 text-primary-400">
                  <FaSearch />
                </div>
                <input
                  type="search"
                  className="w-full px-4 py-2 rounded-lg shadow focus:outline-none focus:shadow-outline text-gray-600 font-medium"
                  placeholder="Search..."
                  value={filterInput}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative">
                <table
                  {...getTableProps()}
                  className={classnames(
                    "border-collapse table-auto w-full whitespace-no-wrap bg-white table-striped relative"
                  )}
                >
                  <thead>
                    {headerGroups.map((headerGroup: any) => (
                      <tr
                        {...headerGroup.getHeaderGroupProps()}
                        className={classnames("text-left")}
                      >
                        {headerGroup.headers.map((column: any) => (
                          <th
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            className={classnames(
                              "bg-gray-100 sticky top-0 border-b border-gray-200 px-6 py-2 text-gray-600 font-bold tracking-wider uppercase text-xs"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{column.render("Header")}</span>
                              <span className="text-primary-400">
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <FaSortDown />
                                  ) : (
                                    <FaSortUp />
                                  )
                                ) : (
                                  " "
                                )}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {rows.map((row: any, i: any) => {
                      prepareRow(row);
                      return (
                        <>
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell: any) => {
                              return (
                                <td
                                  {...cell.getCellProps()}
                                  className={classnames(
                                    "border-dashed border-t border-gray-200 px-3"
                                  )}
                                >
                                  <span
                                    className={classnames(
                                      "text-gray-700 px-6 py-3 flex items-center"
                                    )}
                                  >
                                    {cell.render("Cell")}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                          {row.isExpanded && (
                            <tr>
                              <td colSpan={visibleColumns.length}>
                                <UserRights
                                  authorization={row.original}
                                  setSuccess={setSuccess}
                                  connection={connection}
                                  instanceId={hex2Bytes(
                                    selectedTransaction.instanceid
                                  )}
                                />
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
             
            </>

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
