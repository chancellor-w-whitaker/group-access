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
    reports: "ascending",
    users: "ascending",
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
            {!editing && (
              <button
                className={`btn btn-primary bg-gradient ${
                  !checked.group ? "text-decoration-line-through" : ""
                } ${editing ? "active" : ""}`.trim()}
                onClick={onClickEditButton}
                disabled={!checked.group}
                type="button"
              >
                Edit access
              </button>
            )}
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
                  className="btn btn-danger bg-gradient"
                  onClick={onClickCancelButton}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success bg-gradient"
                  onClick={onClickSaveButton}
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
      icon: <i className="bi bi-people-fill"></i>,
      title: "Groups",
    },
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-secondary bg-gradient ${
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
      icon: <i className="bi bi-person-fill"></i>,
      title: "Users",
    },
    {
      content: (
        <>
          <div className="mb-3 d-flex gap-3 flex-wrap">
            <button
              className={`btn btn-secondary bg-gradient ${
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
      icon: <i className="bi bi-clipboard2-fill"></i>,
      title: "Reports",
    },
  ];

  return (
    <FeatureColumns
      header={
        <div>
          Settings{" "}
          {!checked.group ? (
            <span className="fs-2">{`(Select a group)`}</span>
          ) : (
            ""
          )}
        </div>
      }
    >
      {features}
    </FeatureColumns>
  );
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

  const isGroupItemDisabled = (groupID) =>
    checkedGroup && editing && groupID !== checkedGroup;

  const props = {
    groups: {
      children: Object.entries(groupsList).map(([groupID, object]) => ({
        badges: [
          <span
            className={`badge bg-gradient shadow-sm text-bg-${
              object.userIDs.size ? "light" : "light"
            } d-flex gap-1 align-items-center`}
            key={"users"}
          >
            {object.userIDs.size}
            <i className="bi bi-person-fill"></i>
          </span>,
          <span
            className={`badge bg-gradient shadow-sm text-bg-${
              object.reportIDs.size ? "light" : "light"
            } d-flex gap-1 align-items-center`}
            key={"reports"}
          >
            {object.reportIDs.size}
            <i className="bi bi-clipboard2-fill"></i>
          </span>,
        ],
        className: isGroupItemDisabled(groupID) ? "opacity-25" : "",
        variant: groupID === checkedGroup && "warning",
        disabled: isGroupItemDisabled(groupID),
        checked: groupID === checkedGroup,
        value: groupID,
        type: "radio",
      })),
      onChange: getInputOnChangeHandler(setCheckedGroup),
    },
    reports: {
      children: Object.keys(reportsList)
        .map((reportID) => ({
          variant: reportIDs.has(reportID) && "warning",
          checked: checkedReports.has(reportID),
          className: !checkedGroup ? "" : "",
          disabled: !editing,
          type: "checkbox",
          value: reportID,
        }))
        .sort(sortReports),
      onChange: getInputOnChangeHandler(setCheckedReports),
    },
    users: {
      children: [...usersList]
        .map((userID) => ({
          variant: userIDs.has(userID) && "warning",
          className: !checkedGroup ? "" : "",
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
