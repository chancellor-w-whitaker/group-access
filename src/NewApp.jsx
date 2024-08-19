import { useState, useMemo } from "react";

import { useResettableState } from "./hooks/useResettableState";
import { usePromise } from "./hooks/usePromise";

const constants = {
  defaults: {
    activeGroup: { reportIDs: new Set(), userIDs: new Set() },
    settings: { users: new Set(), reports: {}, groups: {} },
  },
  reports: {
    promise: fetch("data/reports.json").then((response) => response.json()),
    primaryKey: "link",
  },
  users: {
    promise: fetch("data/users.json").then((response) => response.json()),
    primaryKey: "email",
  },
};

const defaultSettings = constants.defaults.settings;

const defaultActiveGroup = constants.defaults.activeGroup;

export default function NewApp() {
  const users = usePromise(constants.users.promise);

  const reports = usePromise(constants.reports.promise);

  const initialSettings = useMemo(() => {
    const getInitialSettings = ({ reports, users }) => {
      const usersArray = Array.isArray(users) ? users : [];

      const reportsArray = Array.isArray(reports) ? reports : [];

      const lists = { users: new Set(), reports: {}, groups: {} };

      const {
        reports: reportsList,
        groups: groupsList,
        users: usersList,
      } = lists;

      usersArray.forEach(
        ({ [constants.users.primaryKey]: userID, ...groupData }) => {
          usersList.add(userID);

          Object.entries(groupData).forEach(([groupID, access]) => {
            if (!(groupID in groupsList)) {
              groupsList[groupID] = {
                reportIDs: new Set(),
                userIDs: new Set(),
              };
            }

            const { userIDs } = groupsList[groupID];

            if (access) userIDs.add(userID);
          });
        }
      );

      reportsArray.forEach(({ groups = [], ...report }) => {
        const reportID = report[constants.reports.primaryKey];

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

    return getInitialSettings({ reports, users });
  }, [reports, users]);

  const [settings, setSettings] = useResettableState(initialSettings);

  const {
    reports: reportsTable,
    groups: groupsTable,
    users: usersTable,
  } = settings ? settings : defaultSettings;

  const [editing, setEditing] = useState(false);

  const [sortDirection, setSortDirection] = useState({
    reports: "none",
    users: "none",
  });

  const iterateSortDirection = (listName) => {
    setSortDirection((state) => {
      const currentDirection = state[listName];

      let nextDirection;

      if (currentDirection === "none") nextDirection = "ascending";

      if (currentDirection === "ascending") nextDirection = "descending";

      if (currentDirection === "descending") nextDirection = "none";

      return { ...state, [listName]: nextDirection };
    });
  };

  const [checkedGroupID, setCheckedGroupID] = useState();

  const { reportIDs, userIDs } = groupsTable[checkedGroupID]
    ? groupsTable[checkedGroupID]
    : defaultActiveGroup;

  const [checkedUserIDs, setCheckedUserIDs] = useResettableState(userIDs);

  const [checkedReportIDs, setCheckedReportIDs] = useResettableState(reportIDs);

  const onGroupListItemChange = (e) => setCheckedGroupID(e.target.value);

  const groupListItems = Object.keys(groupsTable).map((groupID) => ({
    checked: groupID === checkedGroupID,
    onChange: onGroupListItemChange,
    value: groupID,
    type: "radio",
  }));

  return (
    <>
      <ListGroup>{groupListItems}</ListGroup>
    </>
  );
}

const ListGroup = ({ children = [] }) => {
  return (
    <div className="list-group">
      {children.map(({ type = "radio", onChange, checked, value }, index) => (
        <label className="list-group-item d-flex gap-2" key={index}>
          <input
            className="form-check-input flex-shrink-0"
            onChange={onChange}
            checked={checked}
            value={value}
            type={type}
          />
          <span>
            {value}
            {/* <small className="d-block text-body-secondary">
              With support text underneath to add more detail
            </small> */}
          </span>
        </label>
      ))}
    </div>
  );
};
