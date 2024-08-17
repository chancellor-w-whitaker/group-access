import { useState } from "react";

import { usePromise } from "./hooks/usePromise";

const getJsonPromise = (url) => fetch(url).then((response) => response.json());

const [usersPromise, reportsPromise] = [
  getJsonPromise("data/users.json"),
  getJsonPromise("data/reports.json"),
];

const [usersPrimaryKey, reportsPrimaryKey] = ["email", "link"];

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

  const listGroups = useListGroups(lists);

  return (
    <main className="container">
      <div className="my-3 p-3 bg-body rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row p-4 gap-4 py-md-5 align-items-start justify-content-center">
          <ListGroup {...listGroups.users}></ListGroup>
          <ListGroup {...listGroups.groups}></ListGroup>
          <ListGroup {...listGroups.reports}></ListGroup>
        </div>
      </div>
    </main>
  );
}

const ListGroup = ({ onChange, items }) => {
  return (
    <div className="list-group shadow-sm">
      {items.map(
        ({ variant = "light", type = "radio", disabled, checked, value }) => (
          <label
            className={`list-group-item d-flex gap-2 list-group-item-${variant} ${
              disabled ? "disabled" : ""
            }`.trimEnd()}
            key={value}
          >
            <input
              className="form-check-input flex-shrink-0"
              onChange={onChange}
              checked={checked}
              value={value}
              type={type}
            />
            <span>{value}</span>
          </label>
        )
      )}
    </div>
  );
};

const useListGroups = ({
  reports: reportsList,
  groups: groupsList,
  users: usersList,
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
    items: [...usersList].map((userID) => ({
      checked: checkedUsers.has(userID) || userIDs.has(userID),
      variant: userIDs.has(userID) && "warning",
      disabled: !checkedGroup,
      type: "checkbox",
      value: userID,
    })),
    onChange: getOnChange(setCheckedUsers),
  };

  const reportsProps = {
    items: Object.keys(reportsList).map((reportID) => ({
      checked: checkedReports.has(reportID) || reportIDs.has(reportID),
      variant: reportIDs.has(reportID) && "warning",
      disabled: !checkedGroup,
      type: "checkbox",
      value: reportID,
    })),
    onChange: getOnChange(setCheckedReports),
  };

  const groupsProps = {
    items: Object.keys(groupsList).map((groupID) => ({
      variant: groupID === checkedGroup && "warning",
      checked: groupID === checkedGroup,
      value: groupID,
      type: "radio",
    })),
    onChange: getOnChange(setCheckedGroup),
  };

  return { reports: reportsProps, groups: groupsProps, users: usersProps };
};
