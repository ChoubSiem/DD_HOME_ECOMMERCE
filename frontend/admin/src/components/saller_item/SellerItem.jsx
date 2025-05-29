import React from 'react';
import PropTypes from 'prop-types';
import './SellerItem.css';

const SellerItem = ({ name, value, percentage, progress, color }) => {
  return (
    <div className="seller-item">
      <div className="seller-info">
        <div className="seller-name">{name}</div>
        <div className="seller-value">
          {value} <span className="percentage">{percentage}</span>
        </div>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${progress}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

SellerItem.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  percentage: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
};

export default SellerItem;