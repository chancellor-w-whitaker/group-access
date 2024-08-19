import { getJsonPromise } from "../helpers/getJsonPromise";

export const userConstants = {
  promise: getJsonPromise("data/users.json"),
  primaryKey: "email",
};
