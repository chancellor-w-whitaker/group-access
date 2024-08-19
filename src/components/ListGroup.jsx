export const ListGroup = ({ children = [], onChange }) => {
  return (
    <div className="list-group shadow-sm">
      {children.map(
        ({
          variant = "light",
          type = "radio",
          className = "",
          badges = [],
          disabled,
          checked,
          value,
        }) => (
          <label
            className={`list-group-item d-flex gap-2 list-group-item-${variant} ${className}`.trim()}
            title={value}
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
            />
            <span className="text-truncate">{value}</span>
            <div className="ms-auto d-flex gap-2">
              {badges.map((badge) => badge)}
            </div>
          </label>
        )
      )}
    </div>
  );
};
