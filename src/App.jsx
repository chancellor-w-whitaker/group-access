import { useState, useMemo } from "react";

import { getInputOnChangeHandler } from "./helpers/getInputOnChangeHandler";
import { useResettableState } from "./hooks/useResettableState";
import { reportConstants } from "./constants/reportConstants";
import { FeatureColumns } from "./components/FeatureColumns";
import { getInitialLists } from "./helpers/getInitialLists";
import { userConstants } from "./constants/userConstants";
import { miscConstants } from "./constants/miscConstants";
import { ListGroup } from "./components/ListGroup";
import { usePromise } from "./hooks/usePromise";

// have an edit mode per group (items are disabled until then)
// have a delete mode
// have an add mode

const nextSortMethod = {
  ascending: "descending",
  descending: "none",
  none: "ascending",
};

const sortSymbol = {
  descending: "↓",
  ascending: "↑",
  none: "",
};

export default function App() {
  const users = usePromise(userConstants.promise);

  const reports = usePromise(reportConstants.promise);

  const lists = useMemo(
    () => getInitialLists({ reports, users }),
    [reports, users]
  );

  const [settings, setSettings] = useResettableState(lists);

  // export settings to original format

  const [editing, setEditing] = useState(false);

  const [sort, setSort] = useState({
    reports: "none",
    users: "none",
  });

  const changeSort = (listName) => {
    setSort((state) => {
      const nextClick = nextSortMethod[state[listName]];

      return { ...state, [listName]: nextClick };
    });
  };

  const { checked, cancel, props } = useListGroups({
    lists: settings,
    editing,
    sort,
  });

  const saveChanges = () => {
    setSettings((state) => {
      const { reports: reportIDs, group: groupID, users: userIDs } = checked;

      const newState = { ...state };

      newState.groups = { ...newState.groups };

      newState.groups[groupID] = {
        ...newState.groups[groupID],
        reportIDs,
        userIDs,
      };

      return newState;
    });
  };

  const onClickSaveButton = () => {
    setEditing(false);
    saveChanges();
  };

  const onClickEditButton = () => {
    setEditing((state) => !state);
    editing && cancel();
  };

  const onClickCancelButton = () => {
    cancel();
    setEditing(false);
  };

  const onClickUsersSort = () => changeSort("users");

  const onClickReportsSort = () => changeSort("reports");

  const features = [
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-primary ${
                !checked.group ? "text-decoration-line-through" : ""
              } ${editing ? "active" : ""}`.trim()}
              onClick={onClickEditButton}
              disabled={!checked.group}
              type="button"
            >
              Edit Access
            </button>
            {/* <button
              className={`btn btn-danger ${
                editing || !checked.group || 1 !== 2
                  ? "text-decoration-line-through"
                  : ""
              }`.trim()}
              disabled={editing || !checked.group || 1 !== 2}
              type="button"
            >
              Delete
            </button> */}
            {editing && (
              <>
                <button
                  onClick={onClickCancelButton}
                  className="btn btn-danger"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={onClickSaveButton}
                  className="btn btn-success"
                  type="button"
                >
                  Save
                </button>
              </>
            )}
          </div>
          <ListGroup {...props.groups}></ListGroup>
        </>
      ),
      title: "Groups",
    },
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-secondary ${
                !checked.group ? "text-decoration-line-through" : ""
              }`.trim()}
              onClick={onClickUsersSort}
              disabled={!checked.group}
              type="button"
            >{`Sort ${sortSymbol[sort.users]}`}</button>
            {/* <button
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
            </button> */}
          </div>
          <ListGroup {...props.users}></ListGroup>
        </>
      ),
      title: "Users",
    },
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-secondary ${
                !checked.group ? "text-decoration-line-through" : ""
              }`.trim()}
              onClick={onClickReportsSort}
              disabled={!checked.group}
              type="button"
            >
              {`Sort ${sortSymbol[sort.reports]}`}
            </button>
            {/* <button
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
            </button> */}
          </div>
          <ListGroup {...props.reports}></ListGroup>
        </>
      ),
      title: "Reports",
    },
  ];

  return <FeatureColumns header="Access Settings">{features}</FeatureColumns>;
}

const useListGroups = ({
  lists: { reports: reportsList, groups: groupsList, users: usersList },
  sort: { reports: reportsSort, users: usersSort },
  editing,
}) => {
  const [checkedGroup, setCheckedGroup] = useState();

  const { reportIDs, userIDs } = groupsList[checkedGroup]
    ? groupsList[checkedGroup]
    : {
        reportIDs: miscConstants.staticSets[0],
        userIDs: miscConstants.staticSets[1],
      };

  const [checkedUsers, setCheckedUsers] = useResettableState(userIDs);

  const [checkedReports, setCheckedReports] = useResettableState(reportIDs);

  const cancelEditing = () => {
    setCheckedUsers(userIDs);
    setCheckedReports(reportIDs);
  };

  const sortConverters = {
    descending: (bool) => (bool ? 1 : 0),
    ascending: (bool) => (bool ? 0 : 1),
    none: (bool) => (bool ? 0 : 0),
  };

  const reportsSortConverter = sortConverters[reportsSort];

  const sortReports = ({ value: a }, { value: b }) =>
    reportsSortConverter(reportIDs.has(a)) -
    reportsSortConverter(reportIDs.has(b));

  const usersSortConverter = sortConverters[usersSort];

  const sortUsers = ({ value: a }, { value: b }) =>
    usersSortConverter(userIDs.has(a)) - usersSortConverter(userIDs.has(b));

  const props = {
    reports: {
      children: Object.keys(reportsList)
        .map((reportID) => ({
          variant: reportIDs.has(reportID) && "warning",
          checked: checkedReports.has(reportID),
          disabled: !editing,
          type: "checkbox",
          value: reportID,
        }))
        .sort(sortReports),
      onChange: getInputOnChangeHandler(setCheckedReports),
    },
    groups: {
      children: Object.keys(groupsList).map((groupID) => ({
        disabled: checkedGroup && editing && groupID !== checkedGroup,
        variant: groupID === checkedGroup && "warning",
        checked: groupID === checkedGroup,
        value: groupID,
        type: "radio",
      })),
      onChange: getInputOnChangeHandler(setCheckedGroup),
    },
    users: {
      children: [...usersList]
        .map((userID) => ({
          variant: userIDs.has(userID) && "warning",
          checked: checkedUsers.has(userID),
          disabled: !editing,
          type: "checkbox",
          value: userID,
        }))
        .sort(sortUsers),
      onChange: getInputOnChangeHandler(setCheckedUsers),
    },
  };

  const checked = {
    reports: checkedReports,
    group: checkedGroup,
    users: checkedUsers,
  };

  return { cancel: cancelEditing, checked, props };
};
