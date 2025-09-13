import React, { useRef, useState } from 'react';
import { Modal, Button, Divider, Table, message, Input } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined, DownloadOutlined, FileExcelOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import exportToExcel from './ExportExcel';
import 'antd/dist/reset.css';
import './AdjustmentModalDetail.css';
import logo from '../../../assets/logo/DD_Home_Logo 2.jpg';

const { TextArea } = Input;

const AdjustmentModalDetail = ({ open, onCancel, onEdit, adjustment, onApproveItem, onRejectItem, onApproveAll, onRejectAll, permissions }) => {
  const invoiceRef = useRef();
  const [capturing, setCapturing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isRejectAll, setIsRejectAll] = useState(false);
  const [localAdjustment, setLocalAdjustment] = useState(adjustment);

  // Update localAdjustment when prop changes
  React.useEffect(() => {
    setLocalAdjustment(adjustment);
  }, [adjustment]);

  const hasAdjustmentPermissionApprove = permissions.some(
    (p) => p.name === "Adjustment.approve"
  );
  const hasAdjustmentPermissionReject = permissions.some(
    (p) => p.name === "Adjustment.reject"
  );

  const downloadAsImage = () => {
    setCapturing(true);
    message.loading('Capturing image...', 0);

    setTimeout(() => {
      if (invoiceRef.current) {
        html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        })
          .then((canvas) => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `adjustment-${localAdjustment?.reference || 'document'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.destroy();
            message.success('Image downloaded successfully!');
            setCapturing(false);
          })
          .catch((err) => {
            message.destroy();
            message.error('Failed to capture image');
            setCapturing(false);
          });
      }
    }, 500);
  };

  const showRejectModal = (record = null, isAll = false) => {
    setCurrentRecord(record);
    setIsRejectAll(isAll);
    setRejectNote('');
    setRejectModalVisible(true);
  };

const handleRejectConfirm = async () => {
  if (!localAdjustment?.id) {
    message.error("Invalid adjustment ID");
    return;
  }

  try {
    if (isRejectAll) {
      // Call reject all function - assuming it doesn't return a value
      await onRejectAll(localAdjustment.id, rejectNote);
      
      // Close the modal and show success message
      onCancel();
      setRejectModalVisible(false);
    } else if (currentRecord) {
      const itemId = currentRecord.id || currentRecord.item_id || currentRecord.product_id;
      if (!itemId) {
        message.error("Item ID not found");
        return;
      }
      
      // Call the reject function - assuming it doesn't return a value
      await onRejectItem(localAdjustment.id, itemId, rejectNote);
      
      // Update local state with the rejected item
      const updatedItems = localAdjustment.items.map(item => 
        item.id === itemId ? { ...item, status: 'rejected' } : item
      );
      
      setLocalAdjustment({
        ...localAdjustment,
        items: updatedItems
      });
      
      setRejectModalVisible(false);
      setRejectNote("");
      setCurrentRecord(null);
      setIsRejectAll(false);
      message.success("Item rejected successfully");
    }
  } catch (error) {
    message.error(error.message || "Failed to reject item");
  }
};

  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setRejectNote('');
    setCurrentRecord(null);
    setIsRejectAll(false);
  };

  const handleApproveAllClick = async () => {
    if (!localAdjustment?.id) {
      message.error('No adjustment selected');
      return;
    }
    try {
      await onApproveAll(localAdjustment.id);
      onCancel();
    } catch (error) {
      message.error(error.message || 'Failed to approve adjustment');
    }
  };

  const handleApproveItemClick = async (itemId) => {
    if (!localAdjustment?.id) {
      message.error('No adjustment selected');
      return;
    }
    try {
      await onApproveItem(localAdjustment.id, itemId);
      
      // Update local state with the approved item
      const updatedItems = localAdjustment.items.map(item => 
        item.id === itemId ? { ...item, status: 'approved' } : item
      );
      
      setLocalAdjustment({
        ...localAdjustment,
        items: updatedItems
      });
      
      message.success('Item approved successfully');
    } catch (error) {
      message.error(error.message || 'Failed to approve item');
    }
  };

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      render: (text, record, index) => <span>{index + 1}</span>,
      width: '5%',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product) => <span className="product-name">{product?.name || 'N/A'}</span>,
      width: '20%',
      align: 'center',
    },
    {
      title: 'Code',
      key: 'product.code',
      render: (_, record) => (
        <span className="product-code">{record.product?.code || 'N/A'}</span>
      ),
      width: '10%',
      align: 'center',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      align: 'center',
      render: (_, record) => <span className="unit-value">{record.unit_name || record.unit || 'N/A'}</span>,
      width: '10%',
    },
    {
      title: 'QTY',
      dataIndex: 'qty',
      key: 'qty',
      render: (quantity) => <span className="quantity-value">{quantity?.toLocaleString() || 'N/A'}</span>,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'operation',
      key: 'operation',
      render: (type) => (
        <span className={`adjustment-type ${type === 'add' ? 'add-type' : 'remove-type'}`}>
          {type}
        </span>
      ),
      align: 'center',
      width: '10%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status ${status?.toLowerCase() || 'pending'}`}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending'}
        </span>
      ),
      align: 'center',
      width: '10%',
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_, record) => (
          <div className="action-buttons-item">
            {hasAdjustmentPermissionApprove && (
              <Button
                icon={<CheckOutlined />}
                onClick={() => handleApproveItemClick(record.id)}
                disabled={record?.status?.toLowerCase() === 'approved' || record?.status?.toLowerCase() === 'rejected'}
                size="small"
                type="text"
                className="approve-btn"
              />
            )}
            {hasAdjustmentPermissionReject && (
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record, false)}
                disabled={record?.status?.toLowerCase() === 'rejected' || record?.status?.toLowerCase() === 'approved'}
                size="small"
                type="text"
                className="reject-btn"
                danger
              />
            )}
          </div>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  return (
    <>
      <Modal
        className="adjustment-modal"
        open={open}
        onCancel={onCancel}
        footer={null}
        width="60%"
        styles={{ body: { padding: 0 } }}
      >
        <div className="invoice-container" ref={invoiceRef}>
          <header className="invoice-header">
            <div className="header-left">
              <div className="company-logo">
                <img src={logo} alt="Logo" style={{ width: '90px', marginRight: '20px' }} />
              </div>
              <div className="header-info">
                <h1 className="document-title">STOCK ADJUSTMENT</h1>
                <p className="document-reference">Reference: {localAdjustment?.reference || '.............'}</p>
                <p className="document-reference">Adjuster: {localAdjustment?.adjuster?.username || '.............'}</p>
                <p className="document-reference">Warehouse: {localAdjustment?.warehouse?.name || '...........'}</p>
              </div>
            </div>
            <div className="header-right">
              <p className="document-date">
                {localAdjustment?.date
                  ? new Date(localAdjustment.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                  : 'N/A'}
              </p>
            </div>
          </header>
          <main className="invoice-body">
            <Divider className="section-divider" />

            {localAdjustment?.note && (
              <section className="notes-section">
                <Divider orientation="left" className="section-title">
                  Notes
                </Divider>
                <div className="notes-content">
                  <p className="note-text">{localAdjustment.note}</p>
                </div>
              </section>
            )}

            <Table
              dataSource={localAdjustment?.items || []}
              columns={columns}
              pagination={false}
              rowKey={(record) => record.id || record.key || record.product?.id || JSON.stringify(record)}
              bordered
              size="middle"
              className="items-table"
              rowClassName={() => 'table-row'}
            />
          </main>

          <footer className="invoice-footer">
            <div className="action-buttons">
              <Button
                onClick={onCancel}
                icon={<CloseOutlined />}
                className="close-button"
                style={{ border: '1px solid red' }}
              >
                Close
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={downloadAsImage}
                className="image-button"
                loading={capturing}
              >
                Download as Image
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => exportToExcel(localAdjustment, setExportLoading)}
                className="excel-button"
                loading={exportLoading}
              >
                Export to Excel
              </Button>
              {hasAdjustmentPermissionApprove && localAdjustment?.status.toLowerCase() === 'pending' && (
                <Button
                  type="primary"
                  onClick={handleApproveAllClick}
                  icon={<CheckOutlined />}
                  className="approve-all-button"
                >
                  Approve All
                </Button>
              )}
              {hasAdjustmentPermissionReject && localAdjustment?.status.toLowerCase() === 'pending' && (
                <Button
                  danger
                  onClick={() => showRejectModal(null, true)}
                  icon={<CloseCircleOutlined />}
                  className="reject-all-button"
                >
                  Reject All
                </Button>
              )}
            </div>
          </footer>
        </div>
      </Modal>

      <Modal
        title={isRejectAll ? 'Reject All Items' : 'Reject Item'}
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={handleRejectCancel}
        okText="Reject"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <p>Please provide a reason for rejecting {isRejectAll ? 'all items' : 'this item'}:</p>
          <TextArea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Enter rejection note..."
          />
        </div>
      </Modal>
    </>
  );
};

export default AdjustmentModalDetail;