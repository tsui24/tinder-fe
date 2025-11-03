import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastContainer } from "react-toastify";
import { SettingsProvider } from "./utils/useSettings";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState, useCallback, useRef } from "react";
import webSocketService from "./services/webSocketService";
import { getCurrentUserId, isAuthenticated, isLoginPage } from "./utils/auth";
import notification from "./utils/notification";

// Debug helper - expose to global để có thể test từ console
if (process.env.NODE_ENV === "development") {
  window.debugWS = {
    getState: () => webSocketService.getConnectionState(),
    debug: () => webSocketService.debugConnection(),
    testSubscription: () => webSocketService.testSubscription(),
    testNotification: (type = "LIKE") => {
      const testData = {
        type: type,
        userFromUsername: "TestUser",
        userFromId: 999,
        message: "Test notification",
      };
      console.log("🧪 Testing notification:", testData);
      // Directly call notification để test
      if (type === "MATCH") {
        notification.showMatch(
          `Test Match notification from ${testData.userFromUsername}`
        );
      } else {
        notification.showLike(
          `Test Like notification from ${testData.userFromUsername}`
        );
      }
    },
    reconnect: () => webSocketService.forceReconnect(),
    checkAuth: () => {
      const userId = getCurrentUserId();
      const isAuth = isAuthenticated();
      console.log("🔧 Auth Check:", {
        isAuthenticated: isAuth,
        userId: userId,
        token: localStorage.getItem("token") ? "✅ Có" : "❌ Không có",
      });
      return { isAuth, userId };
    },
  };

  console.log("🔧 Debug commands available:");
  console.log("  debugWS.debug() - Show connection info");
  console.log("  debugWS.getState() - Get current state");
  console.log(
    "  debugWS.testNotification('MATCH'|'LIKE') - Test UI notifications"
  );
  console.log("  debugWS.testSubscription() - Test STOMP subscription");
  console.log("  debugWS.reconnect() - Force reconnect");
  console.log("  debugWS.checkAuth() - Check authentication");
}

function AppContent() {
  const [wsConnected, setWsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const initializingRef = useRef(false);

  // Handle WebSocket notifications - useCallback để tránh re-render
  const handleNotification = useCallback((notificationData) => {
    try {
      console.log("🔔 Global notification received:", notificationData);

      if (!notificationData || typeof notificationData !== "object") {
        console.warn("⚠️ Invalid notification data:", notificationData);
        return;
      }

      switch (notificationData.type) {
        case "MATCH":
          notification.showMatch(
            `It's a Match! 🎉 You and ${
              notificationData.userFromUsername || "someone"
            } liked each other!`
          );
          break;
        case "LIKE":
          notification.showLike(
            `${notificationData.userFromUsername || "Someone"} liked you! 💖`
          );
          break;
        default:
          notification.showInfo(
            `New notification: ${JSON.stringify(notificationData)}`
          );
      }
    } catch (error) {
      console.error("❌ Error handling notification:", error);
    }
  }, []);

  // Initialize WebSocket connection - tối ưu hóa logic
  const initWebSocket = useCallback(async () => {
    // Tránh double initialization
    if (initializingRef.current) {
      console.log("⏳ WebSocket đang khởi tạo, skip...");
      return;
    }

    const currentPath = window.location.pathname;
    const shouldConnect = isAuthenticated() && !isLoginPage(currentPath);
    const userId = getCurrentUserId();

    if (!shouldConnect || !userId) {
      console.log(
        "🚫 Không kết nối WebSocket: không authenticated hoặc đang ở login page"
      );
      return;
    }

    // Kiểm tra xem đã kết nối cho user này chưa
    const wsState = webSocketService.getConnectionState();
    if (wsState.connected && wsState.userId === userId) {
      console.log("✅ WebSocket đã kết nối cho user này");
      setWsConnected(true);
      setCurrentUserId(userId);
      // Chỉ update callback
      webSocketService.updateNotificationCallback(handleNotification);
      return;
    }

    // Nếu đang kết nối cho user khác, disconnect trước
    if (wsState.connected && wsState.userId !== userId) {
      console.log("� Switching user, disconnecting old WebSocket connection");
      webSocketService.disconnect();
      setWsConnected(false);
    }

    try {
      initializingRef.current = true;
      console.log("🚀 Khởi tạo WebSocket connection cho user:", userId);

      // Tạo stable callback wrapper để tránh lỗi "callback no longer runnable"
      const stableCallback = (data) => {
        // Check component vẫn mounted và callback vẫn valid
        if (
          initializingRef.current !== null &&
          typeof handleNotification === "function"
        ) {
          try {
            handleNotification(data);
          } catch (error) {
            console.error("❌ Error in notification callback:", error);
          }
        }
      };

      await webSocketService.connect(userId, stableCallback);

      // Double check component vẫn mounted trước khi update state
      if (initializingRef.current !== null) {
        console.log("✅ WebSocket connected successfully");
        setWsConnected(true);
        setCurrentUserId(userId);
      }
    } catch (error) {
      // Chỉ update state nếu component vẫn mounted
      if (initializingRef.current !== null) {
        console.warn("⚠️ WebSocket connection failed:", error.message);
        setWsConnected(false);
        setCurrentUserId(null);
      }
      // App tiếp tục hoạt động bình thường không có WebSocket
    } finally {
      if (initializingRef.current !== null) {
        initializingRef.current = false;
      }
    }
  }, [handleNotification]);

  // Main WebSocket effect
  useEffect(() => {
    initWebSocket();

    // Listen for route/authentication changes
    const handleAuthChange = () => {
      const currentPath = window.location.pathname;
      const shouldConnect = isAuthenticated() && !isLoginPage(currentPath);
      const userId = getCurrentUserId();

      if (!shouldConnect || !userId) {
        if (wsConnected) {
          console.log("🔌 Disconnecting WebSocket - không còn authenticated");
          webSocketService.disconnect();
          setWsConnected(false);
          setCurrentUserId(null);
        }
      } else if (userId !== currentUserId) {
        // User changed, reconnect
        initWebSocket();
      }
    };

    // Listen for storage changes (login/logout từ tab khác)
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("popstate", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("popstate", handleAuthChange);
    };
  }, [initWebSocket, wsConnected, currentUserId]);

  // Disconnect on app unmount
  useEffect(() => {
    return () => {
      // Mark as unmounting
      initializingRef.current = null;
      webSocketService.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
