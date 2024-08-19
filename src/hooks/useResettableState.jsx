import { useState } from "react";

import { useOnChange } from "./useOnChange";

export const useResettableState = (initialState) => {
  const [state, setState] = useState(initialState);

  useOnChange(initialState, () => setState(initialState));

  return [state, setState];
};
