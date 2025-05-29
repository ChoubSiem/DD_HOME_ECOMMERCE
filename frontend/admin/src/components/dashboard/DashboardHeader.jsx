import React from 'react';
import { motion } from "framer-motion";
import { Button } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const DashboardHeader = ({ isCustomizing, setIsCustomizing }) => {
  return (
    <motion.div className="dashboard-header" variants={slideUp}>
      <h1>Dashboard</h1>
      <div className="header-controls">
        <Button 
          type={isCustomizing ? 'primary' : 'default'} 
          onClick={() => setIsCustomizing(!isCustomizing)}
          icon={<BarChartOutlined />}
        >
          {isCustomizing ? 'Done Customizing' : 'Customize View'}
        </Button>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;