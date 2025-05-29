import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './DashboardCard.css';

const DashboardCard = ({ icon, title, amount, trend, trendPositive, iconClassName }) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className={classNames('card-icon', iconClassName)}>
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-content">
        <p className="card-amount">{amount}</p>
        <p className={classNames('card-trend', { positive: trendPositive, negative: !trendPositive })}>
          {trend}
        </p>
      </div>
    </div>
  );
};

DashboardCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  trend: PropTypes.string,
  trendPositive: PropTypes.bool,
  iconClassName: PropTypes.string
};

DashboardCard.defaultProps = {
  trend: '',
  trendPositive: true,
  iconClassName: 'card-icon-blue'
};

export default DashboardCard;