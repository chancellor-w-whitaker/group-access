import { useState } from "react";

import { FeatureColumns } from "./components/FeatureColumns";
import { ListGroup } from "./components/ListGroup";
import { usePromise } from "./hooks/usePromise";

const getJsonPromise = (url) => fetch(url).then((response) => response.json());

const [usersPromise, reportsPromise] = [
  getJsonPromise("data/users.json"),
  getJsonPromise("data/reports.json"),
];

const [usersPrimaryKey, reportsPrimaryKey] = ["email", "link"];

// have an edit mode per group (items are disabled until then)
// have a delete mode
// have an add mode

export default function App() {
  const users = usePromise(usersPromise);

  const reports = usePromise(reportsPromise);

  const getLists = () => {
    const usersArray = Array.isArray(users) ? users : [];

    const reportsArray = Array.isArray(reports) ? reports : [];

    const lists = { users: new Set(), reports: {}, groups: {} };

    const {
      reports: reportsList,
      groups: groupsList,
      users: usersList,
    } = lists;

    usersArray.forEach(({ [usersPrimaryKey]: userID, ...groupData }) => {
      usersList.add(userID);

      Object.entries(groupData).forEach(([groupID, access]) => {
        if (!(groupID in groupsList)) {
          groupsList[groupID] = { reportIDs: new Set(), userIDs: new Set() };
        }

        const { userIDs } = groupsList[groupID];

        if (access) userIDs.add(userID);
      });
    });

    reportsArray.forEach(({ groups = [], ...report }) => {
      const reportID = report[reportsPrimaryKey];

      reportsList[reportID] = report;

      groups.forEach((groupID) => {
        if (!(groupID in groupsList)) {
          groupsList[groupID] = { reportIDs: new Set(), userIDs: new Set() };
        }

        const { reportIDs } = groupsList[groupID];

        reportIDs.add(reportID);
      });
    });

    return lists;
  };

  const lists = getLists();

  const [editing, setEditing] = useState(false);

  const {
    lists: {
      reports: reportsListGroup,
      groups: groupsListGroup,
      users: usersListGroup,
    },
    checked: { group: checkedGroup },
  } = useListGroups({ editing, lists });

  const features = [
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-primary ${
                !checkedGroup ? "text-decoration-line-through" : ""
              } ${editing ? "active" : ""}`.trim()}
              onClick={() => setEditing((state) => !state)}
              disabled={!checkedGroup}
              type="button"
            >
              Edit Access
            </button>
            <button
              className={`btn btn-danger ${
                editing || !checkedGroup || 1 !== 2
                  ? "text-decoration-line-through"
                  : ""
              }`.trim()}
              disabled={editing || !checkedGroup || 1 !== 2}
              type="button"
            >
              Delete
            </button>
            {editing && (
              <>
                <button className="btn btn-secondary" type="button">
                  Cancel
                </button>
                <button className="btn btn-success" type="button">
                  Confirm
                </button>
              </>
            )}
          </div>
          <ListGroup {...groupsListGroup}></ListGroup>
        </>
      ),
      title: "Groups",
    },
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-success text-decoration-line-through`}
              type="button"
              disabled
            >
              Add
            </button>
            <button
              className={`btn btn-danger text-decoration-line-through`}
              type="button"
              disabled
            >
              Delete
            </button>
          </div>
          <ListGroup {...usersListGroup}></ListGroup>
        </>
      ),
      title: "Users",
    },
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className="btn btn-success text-decoration-line-through"
              type="button"
              disabled
            >
              Add
            </button>
            <button
              className="btn btn-danger text-decoration-line-through"
              type="button"
              disabled
            >
              Delete
            </button>
          </div>
          <ListGroup {...reportsListGroup}></ListGroup>
        </>
      ),
      title: "Reports",
    },
  ];

  return (
    <FeatureColumns header="Access Settings">{features}</FeatureColumns>
    // <main className="container">
    //   <div className="my-3 p-3 bg-body rounded shadow-sm">
    //     <div className="d-flex flex-column flex-md-row p-4 gap-4 py-md-5 align-items-start justify-content-center">
    //       <ListGroup {...listGroups.users}></ListGroup>
    //       <ListGroup {...listGroups.groups}></ListGroup>
    //       <ListGroup {...listGroups.reports}></ListGroup>
    //     </div>
    //   </div>
    // </main>
  );
}

const useListGroups = ({
  lists: { reports: reportsList, groups: groupsList, users: usersList },
  editing,
}) => {
  const getOnChange =
    (setState) =>
    ({ target: { value, type } }) =>
      setState((state) => {
        if (type === "radio") return value;

        if (type === "checkbox") {
          const set = new Set(state);

          set.has(value) ? set.delete(value) : set.add(value);

          return set;
        }
      });

  const [checkedUsers, setCheckedUsers] = useState(new Set());

  const [checkedReports, setCheckedReports] = useState(new Set());

  const [checkedGroup, setCheckedGroup] = useState();

  const { reportIDs, userIDs } = groupsList[checkedGroup]
    ? groupsList[checkedGroup]
    : { reportIDs: new Set(), userIDs: new Set() };

  const usersProps = {
    children: [...usersList].map((userID) => ({
      checked: checkedUsers.has(userID) || userIDs.has(userID),
      variant: userIDs.has(userID) && "warning",
      disabled: !checkedGroup,
      type: "checkbox",
      value: userID,
    })),
    onChange: getOnChange(setCheckedUsers),
  };

  const reportsProps = {
    children: Object.keys(reportsList).map((reportID) => ({
      checked: checkedReports.has(reportID) || reportIDs.has(reportID),
      variant: reportIDs.has(reportID) && "warning",
      disabled: !checkedGroup,
      type: "checkbox",
      value: reportID,
    })),
    onChange: getOnChange(setCheckedReports),
  };

  const groupsProps = {
    children: Object.keys(groupsList).map((groupID) => ({
      variant: groupID === checkedGroup && "warning",
      checked: groupID === checkedGroup,
      value: groupID,
      type: "radio",
    })),
    onChange: getOnChange(setCheckedGroup),
  };

  return {
    lists: {
      reports: reportsProps,
      groups: groupsProps,
      users: usersProps,
    },
    checked: { group: checkedGroup },
  };
};
