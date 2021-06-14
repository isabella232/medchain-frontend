import classnames from "classnames";
import { FunctionComponent, useMemo, useState } from "react";
import { FaSearch, FaSortDown, FaSortUp } from "react-icons/fa";
import { useExpanded, useFilters, useSortBy, useTable } from "react-table";
import { ConnectionType } from "../../contexts/ConnectionContext";
import { hex2Bytes } from "../../services/cothorityUtils";
import { tableColumns } from "./columns";
import UserRights from "./UserRights";

const UserTable: FunctionComponent<{
  selectedTransaction: any;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  connection: ConnectionType;
}> = ({ setSuccess, selectedTransaction, connection }) => {
  const [filterInput, setFilterInput] = useState("");
  const columns = useMemo(() => tableColumns, []);
  const handleFilterChange = (e: any) => {
    const value = e.target.value || undefined;
    setFilter("userid", value);
    setFilterInput(value);
  };
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

  return (
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
                    {...column.getHeaderProps(column.getSortByToggleProps())}
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
                          instanceId={hex2Bytes(selectedTransaction.instanceid)}
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
  );
};
export default UserTable;
