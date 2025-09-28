import React from "react";
import authService from "../../api/authService";

import { Form, Input, Button, Card, Typography, Space, Divider } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import "./Login.css";
const { Title, Text, Link } = Typography;
function Login() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Login form submitted:", values);
    authService
      .login(values)
      .then((response) => {
        console.log("Login successful:", response.data);
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Login failed:", errorInfo);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <Title level={2} className="login-title">
              💕 Welcome Back
            </Title>
            <Text type="secondary" className="login-subtitle">
              Sign in to find your perfect match
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="login-form"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
                {
                  min: 3,
                  message: "Username must be at least 3 characters long!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Enter your username"
                size="large"
                className="login-input"
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
                className="login-input"
              />
            </Form.Item>

            <Form.Item className="forgot-password-item">
              <Link href="#" className="forgot-password-link">
                Forgot password?
              </Link>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<LoginOutlined />}
                className="login-button"
                block
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider className="login-divider">
            <Text type="secondary">or</Text>
          </Divider>

          <div className="register-section">
            <Text type="secondary">
              Don't have an account?{" "}
              <Link href="#" className="register-link">
                Sign up here
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
