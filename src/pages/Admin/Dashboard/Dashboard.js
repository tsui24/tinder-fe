import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, message } from "antd";
import {
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import dashboardService from "../../../api/dashboardService/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUserCount: 0,
    totalMatchesCount: 0,
    totalMessageCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard statistics
  const loadDashboardInfo = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getDashboardInfo();
      console.log("📊 Dashboard response:", response);

      const dashboardData = response.data?.result || response.data || {};

      setStats({
        totalUserCount: dashboardData.totalUserCount || 0,
        totalMatchesCount: dashboardData.totalMatchesCount || 0,
        totalMessageCount: dashboardData.totalMessageCount || 0,
      });
    } catch (error) {
      message.error("Failed to load dashboard statistics");
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardInfo();
  }, []);

  if (loading) {
    return (
      <div
        className="dashboard-container"
        style={{ textAlign: "center", padding: "100px 0" }}
      >
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUserCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Matches"
              value={stats.totalMatchesCount}
              prefix={<HeartOutlined />}
              valueStyle={{ color: "#ff4458" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Messages"
              value={stats.totalMessageCount}
              prefix={<MessageOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <h2>Welcome to Tinder Admin Panel</h2>
        <p>
          Manage your application from here. Use the sidebar to navigate between
          different sections.
        </p>
        <div style={{ marginTop: 20 }}>
          <p>
            <strong>Quick Stats:</strong>
          </p>
          <ul>
            <li>👥 {stats.totalUserCount} registered users</li>
            <li>💕 {stats.totalMatchesCount} successful matches</li>
            <li>💬 {stats.totalMessageCount} messages exchanged</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
