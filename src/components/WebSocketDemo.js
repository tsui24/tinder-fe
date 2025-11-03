// Test component để demo WebSocket notifications
import React from "react";
import { Button, Space, Typography, Card } from "antd";
import notification from "../utils/notification";

const { Title, Text } = Typography;

const WebSocketDemo = () => {
  const testMatch = () => {
    const mockMatchData = {
      userFromId: 101,
      userFromUsername: "Sarah Johnson",
      userToId: 2,
      userToUsername: "You",
      type: "MATCH",
    };

    // Simulate WebSocket notification received
    notification.showMatch(
      `It's a Match! 🎉 You and ${mockMatchData.userFromUsername} liked each other!`
    );
  };

  const testLike = () => {
    const mockLikeData = {
      userFromId: 102,
      userFromUsername: "Emma Wilson",
      type: "LIKE",
    };

    // Simulate WebSocket notification received
    notification.showLike(`${mockLikeData.userFromUsername} liked you! 💖`);
  };

  const testInfo = () => {
    notification.showInfo("This is a test info notification from WebSocket");
  };

  return (
    <Card
      title="WebSocket Notification Demo"
      style={{ maxWidth: 500, margin: "20px auto" }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Title level={4}>Test WebSocket Notifications</Title>
          <Text type="secondary">
            Click the buttons below to simulate WebSocket notifications that
            would be received from the backend.
          </Text>
        </div>

        <Space size="middle" wrap>
          <Button
            type="primary"
            onClick={testMatch}
            style={{ background: "#ff4458", borderColor: "#ff4458" }}
          >
            Test Match Notification
          </Button>

          <Button type="default" onClick={testLike}>
            Test Like Notification
          </Button>

          <Button type="default" onClick={testInfo}>
            Test Info Notification
          </Button>
        </Space>

        <div>
          <Text strong>WebSocket Endpoint:</Text>
          <br />
          <Text code>ws://localhost:8080/ws</Text>
          <br />
          <br />

          <Text strong>Subscription:</Text>
          <br />
          <Text code>/user/{userId}/queue/notification</Text>
          <br />
          <br />

          <Text strong>Expected Backend Message Format:</Text>
          <br />
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {`{
  "type": "MATCH" | "LIKE",
  "userFromId": 101,
  "userFromUsername": "Sarah",
  "userToId": 2,
  "userToUsername": "You"
}`}
          </pre>
        </div>
      </Space>
    </Card>
  );
};

export default WebSocketDemo;
