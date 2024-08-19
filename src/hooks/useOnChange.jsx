import { useState } from "react";

export const useOnChange = (value, handler) => {
  const [previousValue, setPreviousValue] = useState(value);

  if (previousValue !== value) {
    setPreviousValue(value);

    typeof handler === "function" && handler(previousValue);
  }
};
