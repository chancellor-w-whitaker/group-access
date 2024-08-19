import { getJsonPromise } from "../helpers/getJsonPromise";

export const reportConstants = {
  promise: getJsonPromise("data/reports.json"),
  primaryKey: "link",
};
