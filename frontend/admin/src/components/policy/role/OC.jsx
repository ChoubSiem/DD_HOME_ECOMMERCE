import React from 'react';
import { Card, Tree, Avatar, Tag, Popover, Button } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CrownOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined
} from '@ant-design/icons';

const { TreeNode } = Tree;

const OrganizationChart = () => {
  const orgData = {
    title: 'CEO',
    name: 'Alex Johnson',
    avatar: 'AJ',
    role: 'Chief Executive Officer',
    department: 'Executive',
    email: 'alex.johnson@company.com',
    phone: '+1 (555) 123-4567',
    children: [
      {
        title: 'CTO',
        name: 'Sarah Williams',
        avatar: 'SW',
        role: 'Chief Technology Officer',
        department: 'Technology',
        email: 'sarah.williams@company.com',
        phone: '+1 (555) 234-5678',
        children: [
          {
            title: 'Engineering Manager',
            name: 'Michael Chen',
            avatar: 'MC',
            role: 'Engineering Lead',
            department: 'Engineering',
            email: 'michael.chen@company.com'
          },
          {
            title: 'Product Manager',
            name: 'Lisa Rodriguez',
            avatar: 'LR',
            role: 'Product Lead',
            department: 'Product',
            email: 'lisa.rodriguez@company.com'
          }
        ]
      },
      {
        title: 'CFO',
        name: 'David Kim',
        avatar: 'DK',
        role: 'Chief Financial Officer',
        department: 'Finance',
        email: 'david.kim@company.com',
        phone: '+1 (555) 345-6789'
      }
    ]
  };

  const renderEmployeeCard = (employee) => (
    <Card 
      style={{ width: 240, borderRadius: 8 }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <Avatar 
          size={40} 
          style={{ backgroundColor: '#1890ff', marginRight: 12 }}
          icon={<UserOutlined />}
        >
          {employee.avatar}
        </Avatar>
        <div>
          <div style={{ fontWeight: 600 }}>{employee.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{employee.role}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: 12 }}>
        <Tag 
          icon={employee.title === 'CEO' ? <CrownOutlined /> : <TeamOutlined />} 
          color={employee.title === 'CEO' ? 'gold' : 'blue'}
        >
          {employee.title}
        </Tag>
        <Tag color="geekblue">{employee.department}</Tag>
      </div>
      
      <div style={{ fontSize: 12, marginBottom: 8 }}>
        <div><MailOutlined /> {employee.email}</div>
        {employee.phone && <div><PhoneOutlined /> {employee.phone}</div>}
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <Popover
          content={
            <div>
              <Button type="text" block>View Profile</Button>
              <Button type="text" block>Send Message</Button>
              <Button type="text" block>Organization</Button>
            </div>
          }
          trigger="click"
          placement="bottomRight"
        >
          <Button shape="circle" icon={<MoreOutlined />} size="small" />
        </Popover>
      </div>
    </Card>
  );

  const renderTreeNodes = (data) => (
    <TreeNode 
      title={renderEmployeeCard(data)} 
      key={data.name}
    >
      {data.children && data.children.map(child => renderTreeNodes(child))}
    </TreeNode>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ 
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>Organization Chart</h2>
        <div>
          <Button type="primary" style={{ marginRight: 8 }}>Export</Button>
          <Button>View All Employees</Button>
        </div>
      </div>
      
      <div style={{ 
        background: '#fff', 
        padding: 24, 
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Tree
          showLine
          defaultExpandAll
          switcherIcon={<TeamOutlined />}
          style={{ background: 'transparent' }}
        >
          {renderTreeNodes(orgData)}
        </Tree>
      </div>
    </div>
  );
};

export default OrganizationChart;