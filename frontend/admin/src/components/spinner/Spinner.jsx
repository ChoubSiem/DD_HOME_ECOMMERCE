// Corrected Spinner.jsx
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React from 'react'; // Make sure this import is correct

const Spinner = ({ fullPage = true, size = 'large' }) => {
  const spinner = <Spin indicator={<LoadingOutlined spin />} size={size} />;
  
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.62)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default Spinner;