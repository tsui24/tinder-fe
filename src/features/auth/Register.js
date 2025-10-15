import React from "react";
import { Form, Input, Button, Card, Typography, Space, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  UserAddOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../utils/notification";
import "./Register.css";

const { Title, Text, Link } = Typography;

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      console.log("Register form submitted:", values);
      const { ...registerData } = values;
      console.log("Register data:", registerData);
      const response = await authService.register(registerData);
      console.log("Registration successful:", response);

      showSuccessNotification(
        "Registration Successful",
        "Your account has been created! Please login."
      );
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      showErrorNotification(
        "Registration Failed",
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Registration failed:", errorInfo);
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <Card className="register-card" bordered={false}>
          <div className="register-header">
            <Title level={2} className="register-title">
              💕 Join TinderApp
            </Title>
            <Text type="secondary" className="register-subtitle">
              Create your account to start dating
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="register-form"
          >
            <Form.Item
              label="Full Name"
              name="fullname"
              rules={[
                {
                  required: true,
                  message: "Please input your full name!",
                },
                {
                  min: 4,
                  message: "Full name must be at least 4 characters long!",
                },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message: "Full name can only contain letters and spaces!",
                },
              ]}
            >
              <Input
                prefix={<IdcardOutlined className="input-icon" />}
                placeholder="Enter your full name"
                size="large"
                className="register-input"
              />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
                {
                  min: 8,
                  message: "Username must be at least 8 characters long!",
                },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message:
                    "Username can only contain letters, numbers, and underscores!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Enter your username"
                size="large"
                className="register-input"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters long!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"
                size="large"
                className="register-input"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Confirm your password"
                size="large"
                className="register-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<UserAddOutlined />}
                className="register-button"
                block
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Divider className="register-divider">
            <Text type="secondary">or</Text>
          </Divider>

          <div className="login-section">
            <Text type="secondary">
              Already have an account?{" "}
              <Link href="/login" className="login-link">
                Sign in here
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Register;
