import React from "react";
import { Button, Card, Row, Col, Typography, Space } from "antd";
import {
  HeartOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./LandingPage.css";

const { Title, Paragraph } = Typography;

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="hero-section">
          <Title level={1} className="landing-title">
            Find Your Perfect Match
          </Title>
          <Paragraph className="landing-subtitle">
            Swipe, Match, Chat - Experience the magic of modern dating
          </Paragraph>

          <Row gutter={[16, 24]} className="feature-grid">
            <Col xs={24} sm={24} md={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-content">
                  <HeartOutlined className="feature-icon" />
                  <Title level={3}>Smart Matching</Title>
                  <Paragraph>
                    Our algorithm finds compatible matches based on your
                    preferences
                  </Paragraph>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-content">
                  <MessageOutlined className="feature-icon" />
                  <Title level={3}>Instant Chat</Title>
                  <Paragraph>
                    Start conversations with your matches right away
                  </Paragraph>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-content">
                  <SafetyCertificateOutlined className="feature-icon" />
                  <Title level={3}>Safe & Secure</Title>
                  <Paragraph>
                    Your privacy and safety are our top priorities
                  </Paragraph>
                </div>
              </Card>
            </Col>
          </Row>

          <Space size="large" className="cta-section">
            <Button type="primary" size="large" className="cta-button">
              Get Started
            </Button>
            <Button size="large" className="cta-button secondary">
              Learn More
            </Button>
          </Space>
        </div>

        <div className="app-preview">
          <div className="phone-mockup">
            <div className="phone-screen">
              <Card
                className="profile-card"
                cover={<div className="profile-image"></div>}
              >
                <Card.Meta title="Sarah, 24" description="2 miles away" />
              </Card>
              <Space size="large" className="action-buttons">
                <Button
                  shape="circle"
                  size="large"
                  icon={<CloseOutlined />}
                  className="action-btn reject"
                  danger
                />
                <Button
                  shape="circle"
                  size="large"
                  icon={<HeartOutlined />}
                  className="action-btn like"
                  type="primary"
                />
              </Space>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
