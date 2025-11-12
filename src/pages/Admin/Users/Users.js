import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Tag,
  Select,
  DatePicker,
} from "antd";
import {
  EditOutlined,
  SearchOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import userService from "../../../api/userService/userManagement";
import dayjs from "dayjs";
import "./Users.css";

const { Option } = Select;

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsersManagement();
      console.log("📊 Users response:", response);

      // Xử lý response
      const usersData = response.data?.result || response.data || [];

      // Đảm bảo data là array
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error("Users data is not an array:", usersData);
        setUsers([]);
        message.warning("Invalid data format received");
      }
    } catch (error) {
      message.error("Failed to load users");
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Show modal for edit
  const showModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      birthday: user.birthday ? dayjs(user.birthday) : null,
    });
    setIsModalVisible(true);
  };

  // Handle update
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format data
      const updateData = {
        ...values,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
      };

      await userService.updateUser(editingUser.username, updateData);
      message.success("User updated successfully");

      setIsModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error("Failed to update user");
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format gender
  const getGenderTag = (gender) => {
    if (gender === 0) {
      return (
        <Tag icon={<WomanOutlined />} color="pink">
          Female
        </Tag>
      );
    } else if (gender === 1) {
      return (
        <Tag icon={<ManOutlined />} color="blue">
          Male
        </Tag>
      );
    } else if (gender === 2) {
      return <Tag color="purple">Other</Tag>;
    }
    return <Tag>Unknown</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.username &&
        record.username.toLowerCase().includes(value.toLowerCase()),
      render: (text) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (gender) => getGenderTag(gender),
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
      render: (location) => location || "N/A",
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
    <div className="users-container">
      <div className="users-header">
        <h1>Users Management</h1>
        <Space>
          <Input
            placeholder="Search by username..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(users) ? users : []}
        rowKey={(record) => record.username || Math.random()}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
        locale={{
          emptyText: "No users found.",
        }}
      />

      <Modal
        title="Edit User"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Update"
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: "Please input full name!" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender!" }]}
          >
            <Select placeholder="Select gender">
              <Option value={1}>
                <ManOutlined /> Male
              </Option>
              <Option value={0}>
                <WomanOutlined /> Female
              </Option>
              <Option value={2}>Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="birthday" label="Birthday">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Select birthday"
            />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="Enter location" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Users;
