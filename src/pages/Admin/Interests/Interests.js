import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import interestService from "../../../api/interestService/interestService";
import "./Interests.css";

function Interests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Load interests
  const loadInterests = async () => {
    setLoading(true);
    try {
      const response = await interestService.getInterests();
      console.log("📊 Interests response:", response);

      // Xử lý response - có thể là array trực tiếp hoặc trong object
      const interestsData = response.data?.result || response.data || [];

      // Đảm bảo data là array
      if (Array.isArray(interestsData)) {
        setInterests(interestsData);
      } else {
        console.error("Interests data is not an array:", interestsData);
        setInterests([]);
        message.warning("Invalid data format received");
      }
    } catch (error) {
      message.error("Failed to load interests");
      console.error("Error loading interests:", error);
      setInterests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
  }, []);

  // Show modal for create/edit
  const showModal = (interest = null) => {
    setEditingInterest(interest);
    if (interest) {
      form.setFieldsValue(interest);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Handle create/update
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingInterest) {
        // Update
        await interestService.updateInterest(editingInterest.id, values);
        message.success("Interest updated successfully");
      } else {
        // Create
        await interestService.createInterest(values);
        message.success("Interest created successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      loadInterests();
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(
        editingInterest
          ? "Failed to update interest"
          : "Failed to create interest"
      );
      console.error("Error saving interest:", error);
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name && record.name.toLowerCase().includes(value.toLowerCase()),
      render: (text) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => showModal(record)}
          size="small"
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="interests-container">
      <div className="interests-header">
        <h1>Interests Management</h1>
        <Space>
          <Input
            placeholder="Search interests..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            Add Interest
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(interests) ? interests : []}
        rowKey={(record) => record.id || record.key || Math.random()}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} interests`,
        }}
        locale={{
          emptyText: "No interests found. Click 'Add Interest' to create one.",
        }}
      />

      <Modal
        title={editingInterest ? "Edit Interest" : "Create New Interest"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingInterest ? "Update" : "Create"}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Interest Name"
            rules={[
              { required: true, message: "Please input interest name!" },
              { min: 2, message: "Name must be at least 2 characters" },
              { max: 50, message: "Name must not exceed 50 characters" },
            ]}
          >
            <Input placeholder="e.g. Photography, Hiking, Cooking" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                max: 200,
                message: "Description must not exceed 200 characters",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Brief description of this interest..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Interests;
