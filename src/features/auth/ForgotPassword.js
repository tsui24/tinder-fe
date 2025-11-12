import React, { useState } from "react";
import authService from "../../api/authService/authService";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../utils/notification";
import { Form, Input, Button, Card, Typography, Space, Result } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "./Login.css"; // Sử dụng chung CSS với Login
import { useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;

function ForgotPassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFinish = async (values) => {
    console.log("Forgot password form submitted:", values);
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(values.email);

      if (response?.data?.code === 200) {
        setIsSuccess(true);
        showSuccessNotification(
          "Email Sent",
          "A new password has been sent to your email address."
        );
        form.resetFields();

        // Tự động chuyển về trang login sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        showErrorNotification(
          "Failed",
          response?.data?.message || "Email not found in system."
        );
      }
    } catch (error) {
      console.error("Forgot password failed:", error);
      showErrorNotification(
        "Failed",
        error.response?.data?.message ||
          "Email not found or server error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form validation failed:", errorInfo);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  if (isSuccess) {
    return (
      <div className="login-container">
        <div className="login-wrapper">
          <Card className="login-card" bordered={false}>
            <Result
              status="success"
              title="Password Reset Email Sent!"
              subTitle="We've sent a new password to your email address. Please check your inbox."
              extra={[
                <Button
                  type="primary"
                  size="large"
                  onClick={handleBackToLogin}
                  key="login"
                >
                  Back to Login
                </Button>,
              ]}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <Title level={2} className="login-title">
              🔐 Forgot Password
            </Title>
            <Text type="secondary" className="login-subtitle">
              Enter your email address and we'll send you a new password
            </Text>
          </div>

          <Form
            form={form}
            name="forgot-password"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="login-form"
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Enter your registered email"
                size="large"
                className="login-input"
              />
            </Form.Item>

            <Form.Item>
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="login-button"
                  loading={isLoading}
                  block
                >
                  Send New Password
                </Button>

                <Button
                  type="default"
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToLogin}
                  block
                >
                  Back to Login
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <div className="register-section" style={{ marginTop: "20px" }}>
            <Text type="secondary">
              Remember your password?{" "}
              <Link onClick={handleBackToLogin} className="register-link">
                Sign in here
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
