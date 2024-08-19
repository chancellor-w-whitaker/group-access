export const ListGroup = ({ children = [], onChange }) => {
  return (
    <div className="list-group shadow-sm">
      {children.map(
        ({ variant = "light", type = "radio", disabled, checked, value }) => (
          <label
            className={`list-group-item d-flex gap-2 list-group-item-${variant}`}
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
          </label>
        )
      )}
    </div>
  );
};
