// components/DynamicFilterInput.jsx
import React from 'react';

const DynamicFilterInput = ({
  name,
  label,
  type = 'text',
  options = [],
  value,
  onChange,
  placeholder,
  ...props
}) => {
  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="filter-input"
            {...props}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="filter-input"
            {...props}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder={placeholder || `Enter ${label}`}
            {...props}
          />
        );

      case 'range':
        return (
          <div className="range-input-container">
            <input
              type="range"
              name={name}
              value={value || ''}
              onChange={handleChange}
              min={props.min || 0}
              max={props.max || 100}
              step={props.step || 1}
              className="filter-range"
              {...props}
            />
            <span className="range-value">{value || 0}</span>
          </div>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={(e) => onChange(name, e.target.checked)}
            className="filter-checkbox"
            {...props}
          />
        );

      default: // text
        return (
          <input
            type="text"
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder={placeholder || `Search ${label}`}
            {...props}
          />
        );
    }
  };

  return (
    <div className="dynamic-filter-input">
      {label && <label htmlFor={name}>{label}</label>}
      {renderInput()}
    </div>
  );
};

export default DynamicFilterInput;