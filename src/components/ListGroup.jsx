import { useState, useId } from "react";

export const ListGroup = ({
  style = { maxHeight: 300 },
  children = [],
  onChange,
}) => {
  const name = useId();

  const [previousChildren, setPreviousChildren] = useState(children);

  const [newValue, setNewValue] = useState();

  if (previousChildren !== children) {
    setPreviousChildren(children);

    if (previousChildren.length === children.length - 1) {
      const previousValues = new Set(
        previousChildren.map(({ value }) => value)
      );

      const differentValue = children.find(
        ({ value }) => !previousValues.has(value)
      ).value;

      setNewValue(differentValue);
    } else {
      setNewValue();
    }
  }

  const getRefCallback = (value) => (node) => {
    if (node) {
      if (value === newValue) {
        node.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  return (
    <div className="list-group shadow-sm overflow-y-scroll" style={style}>
      {children.map(
        ({
          variant = "light",
          type = "radio",
          className = "",
          badges = [],
          description,
          supportText,
          disabled,
          checked,
          value,
          label,
        }) => (
          <label
            className={`list-group-item d-flex gap-2 list-group-item-${variant} ${className}`.trim()}
            title={description ? description : value}
            ref={getRefCallback(value)}
            key={value}
          >
            <input
              className={`form-check-input flex-shrink-0 opacity-${
                disabled ? 0 : 100
              }`}
              disabled={disabled}
              onChange={onChange}
              checked={checked}
              value={value}
              type={type}
              name={name}
            />
            <span className="text-truncate">
              {label ? label : value}
              {supportText && (
                <small className="d-block text-body-secondary text-truncate">
                  {supportText}
                </small>
              )}
            </span>
            <div className="ms-auto d-flex gap-2">
              {badges.map((badge) => badge)}
            </div>
          </label>
        )
      )}
    </div>
  );
};
