// what about flexible bootstrap classes logic?

// bsClasses: { btn: (string, array, or determined to be true or false) }
// string--"primary"
// array--["primary", "lg"]
// else, determine if true

const kebabCase = (string) =>
  string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

const separateProps = (props) => ({
  other: Object.fromEntries(
    Object.entries(props).filter(([propName]) => !propName.startsWith("bs"))
  ),
  bs: Object.fromEntries(
    Object.entries(props).filter(([propName]) => propName.startsWith("bs"))
  ),
});

// bs prop value must be array
// array values must be string
// array strings (camel case to kebab case) get joined with prop name (camel case to kebab case, & bs removed from front) with "-"
// however, if array string is determined to be empty (""), then all that is left is the prop name kebab-ed (which is good for cases like "rounded")
// ! stipulation, this works assuming kebab of "" stays empty string
// * also, no method of having an original array for bs prop, and then modifying this array--the current methodology you've established only allows for setting the prop

const parseBsProps = (bsProps) =>
  Object.entries(bsProps)
    .filter(([propName, array]) => Array.isArray(array))
    .map(([propName, array]) =>
      array
        .filter((string) => typeof string === "string")
        .map((string) =>
          [kebabCase(propName).split("-").slice(1).join("-"), kebabCase(string)]
            .filter((string) => string.length > 0)
            .join("-")
        )
    );

// if we assume bs props will only be given arrays of strings && no default bs values allowed

// for every key in both default bs api & declared bs api, need to merge their arrays
// you can think more about this tomorrow!

// must make sure every property of bs api comes in as array
//

// consume bootstrapClasses below (allow for defaults to be set in generator and for bootstrapClasses to be declared by passing as a prop)

export const generateComponent = ({
  className: defaultClassName = "",
  as: defaultElement = "div",
  ...defaultProps
}) => {
  const Component = ({
    className: declaredClassName = "",
    as = defaultElement,
    ...declaredProps
  }) => {
    const As = as;

    const mergedClassName =
      typeof declaredClassName === "function"
        ? declaredClassName(defaultClassName)
        : [defaultClassName, declaredClassName]
            .filter((string) => typeof string === "string" && string.length > 0)
            .join(" ");

    const retainedDefaultProps = Object.fromEntries(
      Object.entries(defaultProps).filter(
        ([propName]) => !(propName in declaredProps)
      )
    );

    const mergedProps = {
      className: mergedClassName,
      ...retainedDefaultProps,
      ...declaredProps,
    };

    return <As {...mergedProps}></As>;
  };

  return Component;
};
