import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Modal, Table, Row, Col, Typography, message, Form, Input, InputNumber ,Spin} from 'antd';
import React, { useEffect, useState } from 'react';
import EditOpenShift from './EditOpenShift';
import { useSale } from '../../../hooks/UseSale';
import Cookies from 'js-cookie';
import moment from 'moment';
import "./ViewShift.css";
import CloseShiftView from "../../../components/pos/shift/CloseShiftView";
import logo from '../../../assets/logo/DD_Home_Logo 2.jpg';

const { Title, Text } = Typography;

const ViewShiftModal = ({ open, onClose, warehouseId, token, onShiftClosed }) => {
  const [shiftData, setShiftData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [closeShiftLoading, setCloseShiftLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editShiftVisible, setEditShiftVisible] = useState(false);
  const { handleGetOneOpenShift, handleCloseShiftCreate } = useSale();
  const [form] = Form.useForm();
  const userData = JSON.parse(Cookies.get('user') || '{}');
  const shiftId = Cookies.get('shift_id');
  
  const Logo = () => (
    <img
      src={logo}
      alt="Logo"
      style={{ width: '70px', height: '70px' }}
    />
  );
  const handleGetOneShiftData = async () => {
    if (!shiftId || !userData.warehouse_id || !token) {
      setError('Missing required data for shift fetch');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await handleGetOneOpenShift(shiftId, userData.warehouse_id, token);      
      console.log(result);
      
      setLoading(true);
      if (result.success && result.shift) {
        setShiftData(result.shift); 
        setLoading(false);
      } else {
        setError(result?.message || 'No shift found with the specified ID');
      }
    } catch (error) {
      setError('Error fetching shift data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = () => {
    if (!userData.id || !shiftId || !userData.warehouse_id || !token) {
      message.error('Missing required data to close shift');
      return;
    }

    Modal.confirm({
      title: 'Close Shift',
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="final_cash"
            label="Final Cash in Drawer ($)"
            initialValue={shiftData?.starting_amount || 0}
            rules={[{ required: true, message: 'Please enter the final cash amount' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} precision={2} />
          </Form.Item>
          <Form.Item
            name="note"
            label="Note (Optional)"
            initialValue=""
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      ),
      okText: 'Close Shift',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const values = await form.validateFields();
          setCloseShiftLoading(true);
          setError(null);

          const payload = {
            user_id: userData.id,
            open_shift_id: shiftId,
            end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
            final_cash: values.final_cash,
            total_sales: shiftData?.total_sales_amount || 0, 
            note: values.note || null,
            warehouse_id: userData.warehouse_id,
          };

          const result = await handleCloseShiftCreate(payload, token);
          if (result.success) {
            message.success('Shift closed successfully');
            Cookies.remove('shift_id');
            Cookies.remove('shift_amount');
            Cookies.remove('is_openshift');
            Cookies.remove('shift_opened_at');
            setShiftData({ ...shiftData, status: 'completed' }); 
            onShiftClosed?.(shiftId);
            onClose();
            location.reload();
          } else {
            setError(result?.message || 'Failed to close shift');
            message.error(result?.message || 'Failed to close shift');
          }
        } catch (error) {
          setError(error?.message || 'Error closing shift. Please try again.');
          message.error(error?.message || 'Error closing shift. Please try again.');
        } finally {
          setCloseShiftLoading(false);
          form.resetFields();
        }
      },
      onCancel() {
        form.resetFields();
      },
    });
  };

  useEffect(() => {
    if (open && shiftId) {
      handleGetOneShiftData();
    }
  }, [open, shiftId]);

  const productColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'reference',
      key: 'reference',
      render: (_,record) => <span style={{ fontWeight: 500, color: '#1f1f1f' }}>{record.reference}</span>,
    },
    {
      title: 'Date/Time',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date) => (
        <span style={{ color: '#595959' }}>
          {date ? new Date(date).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      align: 'center',
      render: (customer) => (
        <span style={{ color: '#595959' }}>
          {customer?.name || 'N/A'}
        </span>
      ),
      width:"20%"
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: 'center',
      render: (payment_method) => (
        <span style={{ color: '#595959', textTransform: 'capitalize' }}>
          {payment_method?.length > 0 ? payment_method[0]?.payment_types?.toLowerCase() + '(' +payment_method[0].currency +')' || 'N/A' : 'N/A'}
        </span>
      ),
    },
  {
  title: 'Total',
  dataIndex: 'payment_method',
  key: 'payment_method',
  align: 'center',
  render: (_, record) => {
    const payment = record.payment_method?.[0];
    return (
      <span style={{ color: '#595959', textTransform: 'capitalize' }}>
       { "$" + record.total}
      </span>
    );
  },
},



  ];

  const handlePrint = () => {
    window.print();
  };

  const handleEditShift = () => {
    setEditShiftVisible(true);
  };

  const handleSaveEdit = (editedData) => {
    setShiftData(editedData);
    setEditShiftVisible(false);
  };

  const handleCancelEdit = () => {
    setEditShiftVisible(false);
  };

  const productData = shiftData?.data?.posSales || [];
  const totalInvoices = productData.length;
  const totalSalesAmount = shiftData?.data?.total_sales_amount || 0;

  return (
    <Spin spinning={loading}>
      <Modal
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '16px 0',
            }}
          >
                      <Logo />

            <Title
              level={4}
              style={{
                margin: 0,
                color: '#1f1f1f',
                fontWeight: 600,
              }}
            >
              {shiftData?.data.warehouse} - Shift Summary
            </Title>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={
          <Row gutter={16} style={{ marginTop: 16 }}>
            
          </Row>
        }
        width={850}
        centered
        styles={{
          body: {
            padding: '24px',
            background: '#f9f9f9',
          },
          mask: {
            background: 'rgba(0, 0, 0, 0.6)',
          },
        }}
        style={{
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        {loading ? (
          <div>Loading shift data...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : shiftData ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <Row
                gutter={[16, 16]}
                style={{
                  background: '#fff',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Col xs={24} sm={12} md={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>👤</span>
                    <div>
                      <Text strong style={{ color: '#595959', display: 'block' }}>
                        Opened by
                      </Text>
                      <Text style={{ color: '#1f1f1f' }}>{shiftData?.data.salesperson || 'N/A'}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🕒</span>
                    <div>
                      <Text strong style={{ color: '#595959', display: 'block' }}>
                        Opened at
                      </Text>
                      <Text style={{ color: '#1f1f1f' }}>
                        {shiftData.data.opened_at ? new Date(shiftData.data.opened_at).toLocaleString() : 'N/A'}
                      </Text>
                    </div>
                  </div>
                </Col>
               <Col xs={24} sm={12} md={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>💰</span>
                  <div>
                    <Text strong style={{ color: '#595959', display: 'block' }}>
                      Cash Drawer
                    </Text>
                    <Text style={{ color: '#1f1f1f', display: 'block' }}>
                      USD: ${shiftData.meta.initial_cash.usd || '0.00'}
                    </Text>
                    <Text style={{ color: '#1f1f1f', display: 'block' }}>
                      KHR: ៛{shiftData.meta.initial_cash.kh || '0.00'}
                    </Text>
                  </div>
                </div>
              </Col>

                <Col xs={24} sm={12} md={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>📈</span>
                    <div>
                      <Text strong style={{ color: '#595959', display: 'block' }}>
                        Total Sales
                      </Text>
                      <Text style={{ color: '#52c41a', fontWeight: 500 }}>
                        ${shiftData?.data.total_sales_amount || '0.00'}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <Table
              dataSource={productData}
              columns={productColumns}
              pagination={false}
              bordered
              size="middle"
              rowKey="invoice_number"
              style={{
                background: '#fff',
                overflow: 'hidden',
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
              }
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total Invoices</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="center"></Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="center">
                      <Text strong>${totalSalesAmount.toFixed(2)}</Text>
                      
                    </Table.Summary.Cell>
                    {/* <Table.Summary.Cell index={5} align="center"></Table.Summary.Cell> */}
                    <Table.Summary.Cell index={5} align="center">
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </>
        ) : (
          <div>No shift data available</div>
        )}
      </Modal>
      <Modal
        title="Edit Shift"
        open={editShiftVisible}
        onCancel={handleCancelEdit}
        footer={null}
        width={850}
        centered
      >
        {/* <EditOpenShift
          shiftData={shiftData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          token={token}
          warehouseId={warehouseId}
        /> */}
      </Modal>
    </Spin>
  );
};

export default ViewShiftModal;