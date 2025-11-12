import React, { useState } from "react";
import authService from "../../api/authService";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../utils/notification";

import { Form, Input, Button, Card, Typography, Space, Divider } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import "./Login.css";
import { useNavigate } from "react-router-dom";
const { Title, Text, Link } = Typography;
function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isCheck, setIsCheck] = useState(false);

  // Function to decode JWT token and extract role
  const decodeToken = (token) => {
    try {
      // JWT có format: header.payload.signature
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      console.log("🔓 Decoded token:", decoded);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const onFinish = (values) => {
    console.log("Login form submitted:", values);
    authService
      .login(values)
      .then(async (response) => {
        if (response?.data?.code === 200) {
          const token = response?.data?.result?.token;
          localStorage.setItem("token", token);

          // Decode token để lấy role
          const decodedToken = decodeToken(token);

          // Xử lý các trường hợp khác nhau của role trong token
          let role = null;
          if (decodedToken) {
            // Trường hợp 1: role trực tiếp
            if (decodedToken.role) {
              role = decodedToken.role;
            }
            // Trường hợp 2: authorities là array
            else if (
              Array.isArray(decodedToken.authorities) &&
              decodedToken.authorities.length > 0
            ) {
              role = decodedToken.authorities[0];
            }
            // Trường hợp 3: authorities là string
            else if (typeof decodedToken.authorities === "string") {
              role = decodedToken.authorities;
            }
            // Trường hợp 4: scope
            else if (decodedToken.scope) {
              role = decodedToken.scope;
            }
          }

          console.log("🔑 User role from token:", role);

          // Lưu role vào localStorage để sử dụng sau này
          if (role) {
            localStorage.setItem("userRole", role);
          }

          showSuccessNotification(
            "Login Successful",
            "Welcome back! Redirecting..."
          );

          // Kiểm tra role và chuyển hướng
          if (role === "ADMIN" || role === "ROLE_ADMIN") {
            console.log("🔑 Admin user detected, redirecting to /admin");
            navigate("/admin");
          } else {
            // User thường - kiểm tra đã hoàn thiện profile chưa
            const checkResponse = await checkUser();
            if (checkResponse) {
              navigate("/match");
            } else {
              navigate("/register-info");
            }
          }
        } else {
          showErrorNotification(
            "Login Failed",
            response?.data?.message ||
              "Invalid username or password. Please try again."
          );
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
        showErrorNotification(
          "Login Failed",
          error.response?.data?.message ||
            "Invalid username or password. Please try again."
        );
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Login failed:", errorInfo);
  };

  const checkUser = async () => {
    try {
      const response = await authService.check_user();
      console.log("checkUser response:", response);
      const userExists = response.data.result;
      setIsCheck(userExists);
      return userExists; // Return the boolean result
    } catch (error) {
      console.log("checkUser error:", error);
      return false; // Return false if there's an error
    }
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
              <Link
                onClick={() => navigate("/forgot-password")}
                className="forgot-password-link"
              >
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
