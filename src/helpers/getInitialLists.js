import { reportConstants } from "../constants/reportConstants";
import { userConstants } from "../constants/userConstants";

export const getInitialLists = ({ reports, users }) => {
  const usersArray = Array.isArray(users) ? users : [];

  const reportsArray = Array.isArray(reports) ? reports : [];

  const lists = { users: new Set(), reports: {}, groups: {} };

  const { reports: reportsList, groups: groupsList, users: usersList } = lists;

  usersArray.forEach(({ [userConstants.primaryKey]: userID, ...groupData }) => {
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
    const reportID = report[reportConstants.primaryKey];

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
