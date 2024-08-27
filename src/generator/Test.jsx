import { kebabCase } from "./kebabCase";

export const Test = ({ className = "", as = "div", ...props }) => {
  const As = as;

  const bsProps = Object.fromEntries(
    Object.entries(props).filter(([name]) => name.startsWith("bs"))
  );

  const otherProps = Object.fromEntries(
    Object.entries(props).filter(([name]) => !name.startsWith("bs"))
  );

  const bsClasses = Object.entries(bsProps).map(([name, values]) =>
    (Array.isArray(values) ? values : [])
      .filter((value) => typeof value === "string")
      .map((string) => {
        const prefix = kebabCase(name).split("-").slice(1).join("-");

        const suffix = kebabCase(string);

        return [prefix, suffix].filter((string) => string.length > 0).join("-");
      })
  );

  console.log(bsClasses);

  const bsClassName = bsClasses.join(" ");

  const entireClassName = [className, bsClassName]
    .filter((string) => string.length > 0)
    .join(" ");

  return <As className={entireClassName} {...otherProps}></As>;
};
