export const getInputOnChangeHandler =
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
