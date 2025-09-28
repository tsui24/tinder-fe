import React from "react";
import { Layout, Button, Space, Typography, Row, Col } from "antd";
import {
  LoginOutlined,
  HeartOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

function Footer() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <AntFooter className="footer">
      <div className="footer-content">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={4} className="footer-title">
                💕 TinderApp
              </Title>
              <Text className="footer-description">
                Find your perfect match with our smart matching algorithm.
                Experience the magic of modern dating.
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-section-title">
                Quick Links
              </Title>
              <div className="footer-links">
                <Link href="#" className="footer-link">
                  About Us
                </Link>
                <Link href="#" className="footer-link">
                  How It Works
                </Link>
                <Link href="#" className="footer-link">
                  Safety Tips
                </Link>
                <Link href="#" className="footer-link">
                  Success Stories
                </Link>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-section-title">
                Support
              </Title>
              <div className="footer-links">
                <Link href="#" className="footer-link">
                  Help Center
                </Link>
                <Link href="#" className="footer-link">
                  Contact Us
                </Link>
                <Link href="#" className="footer-link">
                  Privacy Policy
                </Link>
                <Link href="#" className="footer-link">
                  Terms of Service
                </Link>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-section-title">
                Get Started
              </Title>
              <Text className="footer-description">
                Ready to find your match?
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={handleLoginClick}
                className="footer-login-btn"
              >
                Login Now
              </Button>
            </div>
          </Col>
        </Row>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Text className="footer-copyright">
                © 2025 TinderApp. All rights reserved.
              </Text>
            </Col>
            <Col xs={24} md={12}>
              <Space size="large" className="footer-contact">
                <Space>
                  <PhoneOutlined className="footer-contact-icon" />
                  <Text className="footer-contact-text">+1 (555) 123-4567</Text>
                </Space>
                <Space>
                  <MailOutlined className="footer-contact-icon" />
                  <Text className="footer-contact-text">
                    hello@tinderapp.com
                  </Text>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
}

export default Footer;
