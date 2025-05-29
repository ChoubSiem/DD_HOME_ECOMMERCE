import { Button, Modal, Table, Row, Col, Typography, message, Form, Input, InputNumber } from 'antd';
import React, { useState } from 'react';
import moment from 'moment';
import Cookies from 'js-cookie';

const { Title, Text } = Typography;

const CloseShiftModal = ({ open, onClose, shiftData, token, userData, warehouseId, onShiftClosed }) => {
  const [form] = Form.useForm();
  const [closeShiftLoading, setCloseShiftLoading] = useState(false);
  const [denominations, setDenominations] = useState([
    { denomination: 500, count: 7, currency: 'KHR' }, // Example: 500៛ x 7
  ]);

  const productColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: text => <span style={{ fontWeight: 500, color: '#1f1f1f' }}>{text}</span>,
    },
    {
      title: 'Date/Time',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: date => (
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
      render: customer => (
        <span style={{ color: '#595959' }}>{customer?.name || 'N/A'}</span>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: 'center',
      render: payment_method => (
        <span style={{ color: '#595959', textTransform: 'capitalize' }}>
          {payment_method?.length > 0
            ? `${payment_method[0]?.payment_types?.toLowerCase()} (${payment_method[0].currency})`
            : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: status => (
        <span
          style={{
            color: status === 'completed' ? '#52c41a' : '#faad14',
            fontWeight: 500,
            textTransform: 'capitalize',
          }}
        >
          {status || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      render: total => (
        <span style={{ color: '#595959' }}>{total ? `$${total}` : 'N/A'}</span>
      ),
    },
    {
      title: 'Paid',
      dataIndex: 'payment_method',
      key: 'paid',
      align: 'center',
      render: payment_method => (
        <span style={{ color: '#595959' }}>
          {payment_method?.length > 0 ? payment_method[0]?.paid : 'N/A'}
        </span>
      ),
    },
  ];

  const productData = shiftData?.data?.posSales || [];
  const totalInvoices = productData.length;
  const totalSalesAmount = shiftData?.data?.total_sales_amount || 0;

  const handlePrint = () => {
    if (!shiftData) {
      message.error('No shift data available to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Failed to open print window. Please allow pop-ups for this site.');
      return;
    }

    const denominationSummary = denominations
      .map(d => `${d.denomination}៛ x ${d.count} = ${(d.denomination * d.count).toLocaleString('km-KH')}៛`)
      .join('<br/>');
    const totalKHR = denominations.reduce((sum, d) => sum + d.denomination * d.count, 0);
    const totalUSD = (totalKHR / 4100).toFixed(2); // Assume 1 USD = 4100 KHR

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shift Summary - ${shiftData?.data.warehouse || 'Warehouse'}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          /* Print CSS will be injected here */
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <img src="http://127.0.0.1:8000/storage/logo/DD_Home_Logo.jpg" class="logo" alt="Logo" onerror="this.src='https://via.placeholder.com/50';">
            <div class="title">${shiftData?.data.warehouse || 'Warehouse'} - Shift Summary</div>
          </div>
          <div class="summary-section">
            <div class="summary-item">
              <span class="summary-icon">👤</span>
              <div>
                <span class="summary-label">Opened by:</span>
                <span class="summary-value">${shiftData?.data.salesperson || 'N/A'}</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">🕒</span>
              <div>
                <span class="summary-label">Opened at:</span>
                <span class="summary-value">${shiftData.meta.timestamp ? new Date(shiftData.meta.timestamp).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">💰</span>
              <div>
                <span class="summary-label">Cash Drawer:</span>
                <span class="summary-value">$${shiftData.meta.initial_cash || '0.00'}</span>
              </div>
            </div>
            <div class="summary-item total-sales">
              <span class="summary-icon">📈</span>
              <div>
                <span class="summary-label">Total Sales:</span>
                <span class="summary-value">$${shiftData?.data.total_sales_amount || '0.00'}</span>
              </div>
            </div>
          </div>
          <div class="denomination-section">
            <h3>Cash Denomination (KHR)</h3>
            <p>${denominationSummary}</p>
            <p><strong>Total KHR:</strong> ${totalKHR.toLocaleString('km-KH')}៛</p>
            <p><strong>Total USD:</strong> $${totalUSD}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date/Time</th>
                <th>Customer</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Total</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              ${productData.map(item => `
                <tr>
                  <td>${item.invoice_number || 'N/A'}</td>
                  <td>${item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</td>
                  <td>${item.customer?.name || 'N/A'}</td>
                  <td>${item.payment_method?.length > 0 ? item.payment_method[0]?.payment_types?.toLowerCase() + '(' + item.payment_method[0].currency + ')' : 'N/A'}</td>
                  <td class="${item.status === 'completed' ? 'status-completed' : 'status-pending'}">${item.status || 'N/A'}</td>
                  <td>$${item.total || '0.00'}</td>
                  <td>${item.payment_method?.length > 0 ? item.payment_method[0]?.paid : 'N/A'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Total Invoices: ${totalInvoices}</strong></td>
                <td colspan="2"><strong>$${totalSalesAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 1500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const handleCloseShiftSubmit = async () => {
    try {
      const values = await form.validateFields();
      setCloseShiftLoading(true);

      const totalKHR = denominations.reduce((sum, d) => sum + d.denomination * d.count, 0);
      const final_cash_usd = (totalKHR / 4100).toFixed(2); // Convert KHR to USD

      const payload = {
        user_id: userData.id,
        open_shift_id: Cookies.get('shift_id'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        final_cash: parseFloat(final_cash_usd),
        total_sales: shiftData?.data?.total_sales_amount || 0,
        note: values.note || null,
        warehouse_id: warehouseId,
      };

      const result = await handleCloseShiftCreate(payload, token);
      if (result.message.includes('Shift Close')) {
        message.success('Shift closed successfully');
        Cookies.remove('shift_id');
        Cookies.remove('shift_amount');
        Cookies.remove('is_openshift');
        Cookies.remove('shift_opened_at');
        onShiftClosed?.(payload.open_shift_id);
        onClose();
      } else {
        message.error(result?.message || 'Failed to close shift');
      }
    } catch (error) {
      message.error(error?.message || 'Error closing shift. Please try again.');
      console.error('Error closing shift:', error);
    } finally {
      setCloseShiftLoading(false);
      form.resetFields();
    }
  };

  const handleDenominationChange = (index, field, value) => {
    const newDenominations = [...denominations];
    newDenominations[index][field] = value;
    setDenominations(newDenominations);
  };

  const addDenominationRow = () => {
    setDenominations([...denominations, { denomination: 0, count: 0, currency: 'KHR' }]);
  };

  return (
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
          <img
            src="http://127.0.0.1:8000/storage/logo/DD_Home_Logo.jpg"
            alt="Logo"
            style={{ height: 60, objectFit: 'contain' }}
          />
          <Title level={4} style={{ margin: 0, color: '#1f1f1f', fontWeight: 600 }}>
            Close Shift - {shiftData?.data.warehouse || 'Warehouse'}
          </Title>
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setDenominations([{ denomination: 500, count: 7, currency: 'KHR' }]);
        onClose();
      }}
      footer={
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Button
              block
              onClick={() => {
                form.resetFields();
                setDenominations([{ denomination: 500, count: 7, currency: 'KHR' }]);
                onClose();
              }}
            >
              Cancel
            </Button>
          </Col>
          <Col span={8}>
            <Button
              block
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                color: '#fff',
              }}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Col>
          <Col span={8}>
            <Button
              block
              type="primary"
              danger
              onClick={handleCloseShiftSubmit}
              loading={closeShiftLoading}
            >
              Close Shift
            </Button>
          </Col>
        </Row>
      }
      width={850}
      centered
      styles={{
        body: { padding: '24px', background: '#f9f9f9' },
        mask: { background: 'rgba(0, 0, 0, 0.6)' },
      }}
      style={{ overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
    >
      {shiftData ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <Row
              className="summary-section"
              gutter={[16, 16]}
              style={{
                background: '#fff',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Col xs={24} sm={12} md={12} className="summary-item">
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
              <Col xs={24} sm={12} md={12} className="summary-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🕒</span>
                  <div>
                    <Text strong style={{ color: '#595959', display: 'block' }}>
                      Opened at
                    </Text>
                    <Text style={{ color: '#1f1f1f' }}>
                      {shiftData.meta.timestamp ? new Date(shiftData.meta.timestamp).toLocaleString() : 'N/A'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={12} className="summary-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>💰</span>
                  <div>
                    <Text strong style={{ color: '#595959', display: 'block' }}>
                      Cash Drawer
                    </Text>
                    <Text style={{ color: '#1f1f1f' }}>
                      ${shiftData.meta.initial_cash || '0.00'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={12} className="summary-item total-sales">
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
            style={{ background: '#fff', overflow: 'hidden' }}
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
                  <Table.Summary.Cell index={4} align="center"></Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="center">
                    <Text strong>${totalSalesAmount.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="center"></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
          <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
            <Divider orientation="left">Cash Denomination (KHR)</Divider>
            {denominations.map((d, index) => (
              <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Form.Item label="Denomination (៛)">
                    <InputNumber
                      min={0}
                      value={d.denomination}
                      onChange={value => handleDenominationChange(index, 'denomination', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Count">
                    <InputNumber
                      min={0}
                      value={d.count}
                      onChange={value => handleDenominationChange(index, 'count', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Total (៛)">
                    <Input
                      value={(d.denomination * d.count).toLocaleString('km-KH')}
                      disabled
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              onClick={addDenominationRow}
              style={{ width: '100%', marginBottom: 16 }}
            >
              Add Denomination
            </Button>
            <Form.Item label="Total KHR">
              <Input
                value={denominations
                  .reduce((sum, d) => sum + d.denomination * d.count, 0)
                  .toLocaleString('km-KH')}
                disabled
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="Total USD (1 USD = 4100 KHR)">
              <Input
                value={(denominations.reduce((sum, d) => sum + d.denomination * d.count, 0) / 4100).toFixed(2)}
                disabled
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="note"
              label="Note (Optional)"
              initialValue=""
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </>
      ) : (
        <div>No shift data available</div>
      )}
    </Modal>
  );
};

export default CloseShiftModal;