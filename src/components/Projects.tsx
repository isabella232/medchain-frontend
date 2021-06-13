import classnames from "classnames";
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GoProject } from "react-icons/go";
import { ConnectionContext } from "../contexts/ConnectionContext";
import {
  byprosQuery,
  getProject,
  sendTransaction,
} from "../services/cothorityGateway";
import { hex2Bytes } from "../services/cothorityUtils";
import { addUserRightsToProject } from "../services/instructionBuilder";
import { ProjectContract, Authorization } from "../services/messages";
import { AddButton, CopyButton } from "./Buttons";
import PageLayout from "./PageLayout";
import { ProjectsPager } from "./Pager";
import PanelElement from "./PanelElement";
import Spinner from "./Spinner";
import { useTable, useFilters, useSortBy, useExpanded } from "react-table";
import { FaSearch, FaSortDown, FaSortUp } from "react-icons/fa";
import { AiFillMinusCircle } from "react-icons/ai";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { GiConfirmed } from "react-icons/gi";
import { MdCancel } from "react-icons/md";
import Error from "./Error";
import TransactionModal from "./TransactionModal";

const AccessRight: FunctionComponent<{
  action: string;
}> = ({ action }) => {
  const setRemoveAdminModalOpen = () => {};

  return (
    <div className="flex space-x-2">
      <p className="">{action}</p>

      <button
        className={classnames("text-red-400")}
        // onClick={(e) => setRemoveAdminModalOpen(true)}
      >
        <AiFillMinusCircle />
      </button>
    </div>
  );
};

const UserRights: FunctionComponent<{
  authorization: Authorization;
}> = ({ authorization }) => {
  return (
    <div className="px-4">
      <PanelElement title="User ID">
        {authorization.userid} <CopyButton elem={authorization.userid} />
      </PanelElement>
      {authorization.queryterms && (
        <PanelElement last title="User Rights">
          {authorization.queryterms.map((term) => {
            return <AccessRight action={term} />;
          })}
          {/* TODO add the function to add rights to a user */}
          <AddButton />
        </PanelElement>
      )}
    </div>
  );
};

const AddUser: FunctionComponent<{
  setShowNewUser: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setShowNewUser }) => {
  const [user, setUser] = useState("");
  const [right, setRights] = useState("");
  const [error, setError] = useState("");
  const [addUserModalIsOpen, setAddUserModalIsOpen] = useState(false);

  const abort = () => {
    setUser("");
    setRights("");
    setError("");
    setShowNewUser(false);
  };
  const addUser = () => {};

  return (
    <div>
      <TransactionModal
        modalIsOpen={addUserModalIsOpen}
        setIsOpen={setAddUserModalIsOpen}
        title="Add user to project"
        executeAction={() => addUser()}
        abortAction={() => setAddUserModalIsOpen(false)}
      ></TransactionModal>
      <div className="">
        <div className="space-y-1">
          <label className="text-xs ml-1 mb-1">New Key:</label>
          <div className="flex space-x-2">
            <input
              name="user"
              className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
              type="text"
              placeholder="user ID"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <button className={classnames("text-green-400")} onClick={() => {}}>
              <GiConfirmed />
            </button>
            <button className={classnames("text-red-400")} onClick={abort}>
              <MdCancel />
            </button>
          </div>
          {error && (
            <Error
              message={error}
              reset={setError}
              title="Transaction failed"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SelectedProject: FunctionComponent<{
  selectedTransaction: any;
  setSelectedTransaction: any;
  success: any;
  setSuccess: any;
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
        Cell: ({ value }: { value: any }) => {
          return value.length;
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

  const addUserRights = (userID: string, queryTerm: string) => {
    const tx = addUserRightsToProject(
      userID,
      queryTerm,
      hex2Bytes(selectedTransaction.instanceid)
    );
    sendTransaction(tx, connection.private)
      .then((res) => {
        console.log(res);
        setSuccess(res);
      })
      .catch((err) => console.log(err));
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
      {selectedTransaction.project.authorizations && (
        <PanelElement title="Users" last>
          {showNewUser ? (
            <AddUser setShowNewUser={setShowNewUser} />
          ) : (
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
                                <UserRights authorization={row.original} />
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PanelElement title="Add a New User" last>
                <AddButton onClick={() => setShowNewUser(true)} />
              </PanelElement>
              {/* TODO add the function to add a user to the project*/}
            </>
          )}

          {/* <button
            onClick={() => addUserRights("userE", "count_per_site_shuffled")}
          >
            click
          </button> */}
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
                <AddButton />
              </PanelElement>
              {/* TODO add the function to add a user to the project*/}
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
    </PageLayout>
  );
};

export default Projects;
