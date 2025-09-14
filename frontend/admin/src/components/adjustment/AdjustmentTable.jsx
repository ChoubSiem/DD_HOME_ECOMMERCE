import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Space, Tag, Popconfirm, Modal, Input } from "antd";
import {
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import AdjustmentModalDetail from "../../components/adjustment/addAdjustment/AdjustmentModalDetail";

const { TextArea } = Input;

const AdjustmentTable = ({
  adjustments,
  handleEdit,
  handleDelete,
  handleReject,
  handleApproveAll,
  handleApproveItem, 
  handleRejectItem,
  handleRejectAll,
  loading,
  permissions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const hasAdjustmentEditPermission = permissions.some(
    (p) => p.name === "Adjustment.edit"
  );
  const hasAdjustmentDeletePermission = permissions.some(
    (p) => p.name === "Adjustment.delete"
  );

  const showModal = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setIsModalOpen(true);
  };

  const handleCancel = () => setIsModalOpen(false);
  const handleRejectModalConfirm = async () => {
    if (rejectNote.trim() === "") {
      message.error("Please provide a rejection note");
      return;
    }
    await handleReject(selectedAdjustment.id, { note: rejectNote });
    setIsRejectModalOpen(false);
  };

  const items = (adjustment) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View Details",
      onClick: () => showModal(adjustment),
    },
    ...(hasAdjustmentEditPermission ? [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEdit(adjustment),
    },
    ] : []),
        ...(hasAdjustmentDeletePermission ? [
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => handleDelete(adjustment.id),
    },
    ] : []),
  ];  

  const renderStatus = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "partial":
        return <Tag color="teal">Partial</Tag>;
      default:
        return <Tag color="orange">Pending</Tag>;
    }
  };

  const columns = [
    {
      name: "No",
      selector: (row) => row.no,
      sortable: true,
      cell: (row, index) => <strong>{index + 1}</strong>,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      cell: (row) => <span>{new Date(row.date).toLocaleDateString()}</span>,
    },
    {
      name: "Reference",
      selector: (row) => row.reference,
      sortable: true,
      cell: (row) => <strong>{row.reference}</strong>,
    },
    {
      name: "Adjuster",
      selector: (row) => row.adjuster,
      sortable: true,
      cell: (row) => <strong>{row.adjuster?.username || "N/A"}</strong>,
    },
    {
      name: "Warehouse",
      selector: (row) => row.warehouse?.name,
      sortable: true,
      cell: (row) => <strong>{row.warehouse?.name || "Head Office"}</strong>,
    },
    {
      name: "Note",
      selector: (row) => row.note,
      sortable: true,
      cell: (row) => <strong>{row.note}</strong>,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => renderStatus(row.status),
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Dropdown
            menu={{ items: items(row) }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={adjustments}
        progressPending={loading}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 50, 100]}
        highlightOnHover
        onRowClicked={(row) => showModal(row)}
      />

      <AdjustmentModalDetail
        open={isModalOpen}
        onCancel={handleCancel}
        adjustment={selectedAdjustment}
        permissions={permissions}
        onApproveAll={handleApproveAll}
        onApproveItem={handleApproveItem} 
        onRejectItem={handleRejectItem} 
        onRejectAll={handleRejectAll} 
      />

      <Modal
        title="Reject Adjustment"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={handleRejectModalConfirm}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={4}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="Add a note for rejection..."
        />
      </Modal>
    </div>
  );
};

export default AdjustmentTable;