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

// if someone adds something to default external, need team to be notified through email

// * if new user or list item gets added, and doesn't get placed at the top due to sorting, should the list automatically scroll to them?
// * in other words, need to make each list scrollable with constant height,
// * and when new item gets added, make list scrollTo new item
// * also keep in mind how the onClick function for adding a new group will differ from the new user version
// * add title & url (in small font) to report list items (make element title={description})
// * search for each column
// * export in original format

// ! search for report should include url as well
// ! when not editing, give ability to click (activate) user or report to show connections
// ! check all/uncheck all

const downloadJson = (json, filename = "example") => {
  // Turn the JSON object into a string
  const data = JSON.stringify(json);

  // Pass the string to a Blob and turn it
  // into an ObjectURL
  const blob = new Blob([data], { type: "application/json" });
  const jsonObjectUrl = URL.createObjectURL(blob);

  // Create an anchor element, set it's
  // href to be the Object URL we have created
  // and set the download property to be the file name
  // we want to set
  const anchorEl = document.createElement("a");
  anchorEl.href = jsonObjectUrl;
  anchorEl.download = `${filename}.json`;

  // There is no need to actually attach the DOM
  // element but we do need to click on it
  anchorEl.click();

  // We don't want to keep a reference to the file
  // any longer so we release it manually
  URL.revokeObjectURL(jsonObjectUrl);
};

const backToOriginalFormat = (settings) => {
  const { reports, groups, users } = settings;

  const reportsJson = Object.entries(reports).map(([reportID, report]) => {
    const relevantGroups = Object.entries(groups)
      .filter(([groupID, { reportIDs }]) => reportIDs.has(reportID))
      .map(([groupID]) => groupID);

    return { ...report, groups: relevantGroups };
  });

  const usersJson = [...users].map((userID) => ({
    [userConstants.primaryKey]: userID,
    ...Object.fromEntries(
      Object.entries(groups).map(([groupID, { userIDs }]) => [
        groupID,
        userIDs.has(userID) ? 1 : null,
      ])
    ),
  }));

  return { reports: reportsJson, users: usersJson };
};

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

const SearchInput = ({
  placeholder = "Type to filter...",
  autoComplete = "false",
  className = "mb-3",
  type = "search",
  onChange,
  ...rest
}) => {
  const entireClassName = `form-control ${className}`.trim();

  const handleChange = (e) => onChange(e.target.value);

  return (
    <input
      className={entireClassName}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={handleChange}
      type={type}
      {...rest}
    />
  );
};

const NewItemField = ({
  buttonDisabled,
  inputDisabled,
  onChange,
  onClick,
  value,
}) => {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <form className="d-flex mb-3">
      <input
        className="form-control me-2"
        disabled={inputDisabled}
        onChange={handleChange}
        placeholder="New item"
        value={value}
        type="text"
      />
      <button
        className="btn btn-outline-success"
        disabled={buttonDisabled}
        onClick={onClick}
        type="submit"
      >
        Add
      </button>
    </form>
  );
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

  const { newItemFields, conditions, checked, cancel, search, props } =
    useListGroups({
      lists: settings,
      setSettings,
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
                  conditions.cannotEdit || !checked.group
                    ? "text-decoration-line-through"
                    : ""
                } ${editing ? "active" : ""}`.trim()}
                disabled={!checked.group || conditions.cannotEdit}
                onClick={onClickEditButton}
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
          <div>
            <NewItemField {...newItemFields.groups}></NewItemField>
          </div>
          <div>
            <SearchInput {...search.groups}></SearchInput>
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
          <div>
            <NewItemField {...newItemFields.users}></NewItemField>
          </div>
          <div>
            <SearchInput {...search.users}></SearchInput>
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
          <div>
            <NewItemField buttonDisabled inputDisabled></NewItemField>
          </div>
          <div>
            <SearchInput {...search.reports}></SearchInput>
          </div>
          <ListGroup {...props.reports}></ListGroup>
        </>
      ),
      icon: <i className="bi bi-clipboard2-fill"></i>,
      title: "Reports",
    },
  ];

  const exportJson = () => {
    const files = backToOriginalFormat(settings);

    Object.entries(files).forEach(([filename, json]) =>
      downloadJson(json, filename)
    );
  };

  return (
    <FeatureColumns
      header={
        <div className="d-flex gap-2 flex-wrap">
          <div>Settings</div>
          <div>
            {!checked.group ? (
              <span className="fs-2">{`(Select a group)`}</span>
            ) : (
              ""
            )}
          </div>
          <div>
            <button
              className="btn btn-primary bg-gradient"
              onClick={exportJson}
              type="button"
            >
              Export
            </button>
          </div>
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
  setSettings,
  editing,
}) => {
  const [checkedGroup, setCheckedGroup] = useState();

  const [groupSearchValue, onGroupSearchValueChange] = useState("");

  const groupsSearch = {
    onChange: onGroupSearchValueChange,
    value: groupSearchValue,
    disabled: editing,
  };

  const { reportIDs, userIDs } = groupsList[checkedGroup]
    ? groupsList[checkedGroup]
    : {
        reportIDs: miscConstants.staticSets[0],
        userIDs: miscConstants.staticSets[1],
      };

  const [checkedUsers, setCheckedUsers] = useResettableState(userIDs);

  const [userSearchValue, onUserSearchValueChange] = useState("");

  const usersSearch = {
    onChange: onUserSearchValueChange,
    value: userSearchValue,
    disabled: editing,
  };

  const [checkedReports, setCheckedReports] = useResettableState(reportIDs);

  const [reportSearchValue, onReportSearchValueChange] = useState("");

  const reportsSearch = {
    onChange: onReportSearchValueChange,
    value: reportSearchValue,
    disabled: editing,
  };

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

  const search = {
    reports: reportsSearch,
    groups: groupsSearch,
    users: usersSearch,
  };

  const props = {
    groups: {
      children: Object.entries(groupsList)
        .map(([groupID, object]) => ({
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
        }))
        .filter(({ value }) =>
          value.toLowerCase().includes(groupSearchValue.toLowerCase())
        ),
      onChange: getInputOnChangeHandler(setCheckedGroup),
    },
    reports: {
      children: Object.entries(reportsList)
        .map(([reportID, { description, title }]) => ({
          supportText: (
            <a href={reportID} target="_blank" rel="noopener">
              {reportID}
            </a>
          ),
          variant: reportIDs.has(reportID) && "warning",
          checked: checkedReports.has(reportID),
          className: !checkedGroup ? "" : "",
          disabled: !editing,
          type: "checkbox",
          value: reportID,
          label: title,
          description,
        }))
        .filter(({ label }) =>
          label.toLowerCase().includes(reportSearchValue.toLowerCase())
        )
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
        .filter(({ value }) =>
          value.toLowerCase().includes(userSearchValue.toLowerCase())
        )
        .sort(sortUsers),
      onChange: getInputOnChangeHandler(setCheckedUsers),
    },
  };

  const checked = {
    reports: checkedReports,
    group: checkedGroup,
    users: checkedUsers,
  };

  const cannotEdit = !props.groups.children.find(
    ({ value }) => value === checkedGroup
  );

  const [newUser, onNewUserChange] = useState("");

  const newUserField = {
    onClick: (e) => {
      e.preventDefault();

      onNewUserChange("");

      setSettings(({ users, ...rest }) => ({
        users: new Set([newUser, ...users]),
        ...rest,
      }));
    },
    buttonDisabled:
      [...usersList].find(
        (value) => value.toLowerCase() === newUser.toLowerCase()
      ) || !newUser,
    onChange: onNewUserChange,
    inputDisabled: editing,
    value: newUser,
  };

  const [newGroup, onNewGroupChange] = useState("");

  const newGroupField = {
    onClick: (e) => {
      e.preventDefault();

      onNewGroupChange("");

      setSettings(({ groups, ...rest }) => ({
        groups: Object.fromEntries([
          [newGroup, { reportIDs: new Set(), userIDs: new Set() }],
          ...Object.entries(groups),
        ]),
        ...rest,
      }));
    },
    buttonDisabled:
      Object.keys(groupsList).find(
        (value) => value.toLowerCase() === newGroup.toLowerCase()
      ) || !newGroup,
    onChange: onNewGroupChange,
    inputDisabled: editing,
    value: newGroup,
  };

  return {
    newItemFields: { groups: newGroupField, users: newUserField },
    conditions: { cannotEdit },
    cancel: cancelEditing,
    checked,
    search,
    props,
  };
};
