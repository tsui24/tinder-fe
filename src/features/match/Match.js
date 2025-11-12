import React, { useState, useEffect } from "react";
import {
  Button,
  Avatar,
  Card,
  Empty,
  Spin,
  Row,
  Col,
  Typography,
  Modal,
  Input,
  List,
  Badge,
} from "antd";
import {
  MessageOutlined,
  ProfileOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  EyeInvisibleOutlined,
  HeartFilled,
  CloseOutlined,
  StarFilled,
  HeartOutlined,
  UserOutlined,
  EyeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import TinderCard from "./TinderCard";
import { useNavigate } from "react-router-dom";
import matchUserService from "../../api/userService/matchUser";
import notification from "../../utils/notification"; // Re-enabled for notifications
import { getCurrentUserId } from "../../utils/auth";
import webSocketService from "../../services/webSocketService";
import "./Match.css";

const Match = () => {
  const navigate = useNavigate();

  // Handle logout: clear localStorage and redirect to landing page
  const handleLogout = () => {
    try {
      console.log("🔒 Logging out: clearing localStorage and redirecting");
      localStorage.clear();
    } catch (err) {
      console.warn("Error clearing localStorage:", err);
    }
    // Navigate to landing page (root)
    navigate("/");
    // Optionally reload to ensure app state is reset
    // window.location.reload();
  };

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0); // Track original count
  const [showNoUsersMessage, setShowNoUsersMessage] = useState(false); // Show no users overlay

  // Likes feature states
  const [showLikesOverlay, setShowLikesOverlay] = useState(false);
  const [usersWhoLikedMe, setUsersWhoLikedMe] = useState([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Messages feature states
  const [showMessagesOverlay, setShowMessagesOverlay] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchesLoaded, setMatchesLoaded] = useState(false); // ✅ Track xem đã load matches chưa
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [totalUnreadCount, setTotalUnreadCount] = useState(0); // ✅ Tổng số MATCH có tin nhắn chưa đọc (không phải tổng số tin nhắn)
  const [hasNewMessage, setHasNewMessage] = useState(false); // Để trigger hiệu ứng khi có tin nhắn mới

  // Transform API data to match our card format
  const transformUserData = (apiUsers) => {
    return apiUsers.map((user) => ({
      id: user.userId,
      name: user.fullName,
      age: user.age || 25, // Default age if 0
      distance: `${user.distanceKm.toFixed(1)} km away`,
      images: user.imagesList || [],
      bio: user.bio || "No bio available",
      company: user.company || "Unknown",
      school: user.school || "Unknown",
      interests: user.interestsList || [],
      tall: user.tall,
      location: user.location,
      finalScore: user.finalScore,
      verified: Math.random() > 0.5, // Random verification for demo
    }));
  };

  // Load users who liked me function
  const loadUsersWhoLikedMe = async () => {
    setLikesLoading(true);
    try {
      const response = await matchUserService.getUsersWhoLikedMe();
      if (
        response &&
        response.data.result &&
        Array.isArray(response.data.result)
      ) {
        setUsersWhoLikedMe(response.data.result);
      } else {
        console.error("Invalid likes data format:", response);
        setUsersWhoLikedMe([]);
      }
    } catch (error) {
      console.error("Error loading users who liked me:", error);
      setUsersWhoLikedMe([]);
    } finally {
      setLikesLoading(false);
    }
  };

  // Show user detail modal
  const handleShowUserDetail = (user) => {
    console.log("🔍 Opening user detail for:", user.fullName);
    setSelectedUser(user);
    setShowUserModal(true);
    console.log("🔍 Modal state set to true");
  };

  // Handle like back action
  const handleLikeBack = async (user) => {
    try {
      await matchUserService.likeUser(user.userId);
      // Remove user from likes list since they're now matched
      setUsersWhoLikedMe((prev) =>
        prev.filter((u) => u.userId !== user.userId)
      );
      setShowUserModal(false);
      // You can add a success message here
      console.log(`Liked back ${user.fullName}`);
    } catch (error) {
      console.error("Error liking back user:", error);
    }
  };

  // ✅ Load unread match count - gọi API count-match-not-read
  // Được gọi NGAY KHI VÀO TRANG MATCH (không cần click vào Messages tab)
  const loadUnreadMatchCount = async () => {
    try {
      console.log("🔄 Loading unread match count from API...");
      const response = await matchUserService.getUnreadMatchCount();

      if (response && response.data && response.data.code === 200) {
        const unreadCount = response.data.result || 0;
        console.log("✅ Unread match count loaded:", unreadCount);
        setTotalUnreadCount(unreadCount); // Hiển thị badge ngay

        if (unreadCount > 0) {
          setHasNewMessage(true);
        }
      } else {
        console.error("❌ Invalid unread count response:", response);
      }
    } catch (error) {
      console.error("❌ Error loading unread match count:", error);
    }
  };

  // Load matches function
  const loadMatches = async () => {
    setMessagesLoading(true);
    try {
      console.log("🔄 Loading matches from API...");
      const response = await matchUserService.getMatches();

      console.log("📡 API Response:", response);

      if (response && response.data && response.data.code === 200) {
        const apiMatches = response.data.result || [];
        console.log("✅ Matches loaded:", apiMatches);

        // Transform API data to match our UI format
        const transformedMatches = apiMatches.map((match) => {
          // Format lastMessageTime nếu có
          let formattedLastMessageTime = null;
          if (match.lastMessageTime) {
            try {
              const date = new Date(match.lastMessageTime);
              formattedLastMessageTime = date.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // 24-hour format
              });
              console.log(
                "🕒 Match time formatted:",
                match.lastMessageTime,
                "→",
                formattedLastMessageTime
              );
            } catch (timeError) {
              console.warn("Error formatting match time:", timeError);
              formattedLastMessageTime = match.lastMessageTime;
            }
          }

          return {
            id: match.matchId,
            userId: match.userId,
            fullName: match.fullName,
            avatar: match.avatarUrl,
            lastMessage: match.lastMessage || "Chưa có tin nhắn",
            lastMessageTime: formattedLastMessageTime,
            unreadCount: match.numberOfMessDontSend || 0, // ✅ Lấy từ API
            isRead: match.isRead !== undefined ? match.isRead : true, // ✅ Trạng thái đã đọc
          };
        });

        setMatches(transformedMatches);
        setMatchesLoaded(true); // ✅ Đánh dấu đã load matches

        // ✅ KHÔNG tính lại count ở đây
        // Count đã được load từ API count-match-not-read khi vào trang
        // Chỉ update count qua WebSocket hoặc khi click vào match

        console.log("🎉 Transformed matches:", transformedMatches);
        console.log("📊 Current unread count:", totalUnreadCount);
      } else {
        console.error("❌ Invalid API response:", response);
        setMatches([]);
      }
    } catch (error) {
      console.error("❌ Error loading matches:", error);
      setMatches([]);

      // Log lỗi nhưng không hiển thị notification
      if (error.response?.status === 401) {
        console.error("❌ Session expired");
      } else if (error.response?.status === 404) {
        console.warn("⚠️ No matches found");
      } else {
        console.error("❌ Error loading matches");
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  // Load messages for selected match
  const loadMessages = async (matchId) => {
    try {
      console.log("🔄 Loading messages for matchId:", matchId);

      const response = await matchUserService.getMessages(matchId);
      console.log("📡 Messages API Response:", response);

      if (response && response.data) {
        const { code, message: apiMessage, result } = response.data;

        // Handle 204 No Content - chưa có tin nhắn
        if (code === 204) {
          console.log("📭 No messages found for this match");
          setMessages([]);
          return;
        }

        // Handle 200 OK - có tin nhắn
        if (code === 200 && result) {
          console.log("✅ Messages loaded:", result);

          // Get current user ID để xác định ai là người gửi
          const currentUserId = getCurrentUserId();
          console.log("👤 Current User ID:", currentUserId);

          // Transform API messages to UI format
          const transformedMessages = result.map((msg, index) => {
            // Check if current user is the sender
            const isCurrentUserSender =
              msg.senderId === parseInt(currentUserId);

            // Format timestamp - hiển thị ngày tháng và thời gian 24h
            let formattedTime = "Unknown time";
            if (msg.sentAt) {
              try {
                const date = new Date(msg.sentAt);

                // Format: DD/MM/YYYY HH:MM
                formattedTime = date.toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false, // 24-hour format
                });

                console.log(
                  "🕒 Formatted time:",
                  msg.sentAt,
                  "→",
                  formattedTime
                );
              } catch (timeError) {
                console.warn("Error formatting time:", timeError);
                formattedTime = msg.sentAt;
              }
            }

            return {
              id: index + 1, // Simple ID for UI
              matchId: msg.matchId,
              senderId: msg.senderId,
              senderName: msg.senderName,
              message: msg.content,
              timestamp: formattedTime,
              isOwn: isCurrentUserSender, // true nếu tin nhắn của mình
              read: msg.read,
              sentAt: msg.sentAt,
            };
          });

          console.log("🎉 Transformed messages:", transformedMessages);
          setMessages(transformedMessages);
        } else {
          console.error("❌ Unexpected API response:", response.data);
          setMessages([]);
        }
      } else {
        console.error("❌ Invalid API response structure:", response);
        setMessages([]);
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      setMessages([]);

      // Log error codes nhưng không hiển thị notification
      if (error.response?.status === 404) {
        console.warn("⚠️ Match not found");
      } else if (error.response?.status === 401) {
        console.error("❌ Session expired");
      } else {
        console.error("❌ Error loading messages");
      }
    }
  };

  // Handle match selection
  const handleMatchSelect = async (match) => {
    setSelectedMatch(match);
    loadMessages(match.id);

    // ✅ Khi click vào match có tin nhắn chưa đọc → count--
    if (match.unreadCount > 0 || !match.isRead) {
      // Gọi API để đánh dấu tin nhắn là đã đọc
      try {
        console.log("📖 Marking messages as read for match:", match.id);
        await matchUserService.markMessagesAsRead(match.id);
        console.log("✅ Messages marked as read successfully");
      } catch (error) {
        console.error("❌ Error marking messages as read:", error);
      }

      // Update UI state
      setMatches((prev) =>
        prev.map((m) =>
          m.id === match.id ? { ...m, unreadCount: 0, isRead: true } : m
        )
      );

      // ✅ COUNT-- (Giảm 1 match chưa đọc)
      console.log("📊 COUNT-- Clicked on unread match, decrementing count");
      console.log("   Match ID:", match.id);
      console.log("   Match name:", match.fullName);
      setTotalUnreadCount((prev) => {
        const newCount = Math.max(0, prev - 1);
        console.log("   Count change:", prev, "→", newCount);
        return newCount;
      });

      // Tắt hiệu ứng nếu không còn match chưa đọc
      if (totalUnreadCount <= 1) {
        setHasNewMessage(false);
      }
    }
  };

  // Handle send message with real API
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) {
      console.warn(
        "⚠️ Cannot send message: empty message or no selected match"
      );
      return;
    }

    const messageContent = newMessage.trim();
    const currentUserId = getCurrentUserId();

    try {
      console.log("📤 Sending message:", {
        matchId: selectedMatch.id,
        receiverId: selectedMatch.userId,
        content: messageContent,
      });

      // Call API để gửi tin nhắn
      const response = await matchUserService.sendMessage({
        matchId: selectedMatch.id,
        receiverId: selectedMatch.userId,
        content: messageContent,
      });

      console.log("✅ Message sent successfully:", response);

      // Format timestamp
      const formattedTime = new Date().toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Tạo message object cho UI
      const sentMessage = {
        id: Date.now(),
        matchId: selectedMatch.id,
        senderId: parseInt(currentUserId),
        senderName: "You",
        message: messageContent,
        timestamp: formattedTime,
        isOwn: true,
        read: false,
        sentAt: new Date().toISOString(),
      };

      // Update messages list
      setMessages((prev) => [...prev, sentMessage]);

      // Clear input
      setNewMessage("");

      // Update last message in matches list
      setMatches((prev) => {
        const updatedMatches = prev.map((match) =>
          match.id === selectedMatch.id
            ? {
                ...match,
                lastMessage: messageContent,
                lastMessageTime: formattedTime,
                unreadCount: 0, // Reset vì đây là tin nhắn của mình
              }
            : match
        );

        // ✅ KHÔNG cần recalculate count khi gửi tin nhắn
        // Count chỉ thay đổi khi nhận tin nhắn mới từ người khác

        return updatedMatches;
      });

      console.log("💬 Message updated in UI successfully");
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Log error cases nhưng không hiển thị notification
      if (error.response?.status === 404) {
        console.warn("⚠️ Match not found");
      } else if (error.response?.status === 401) {
        console.error("❌ Session expired");
      } else {
        console.error("❌ Error sending message");
      }
    }
  };

  // Debug function to test WebSocket connection
  // const testWebSocketConnection = () => {
  //   const currentUserId = getCurrentUserId() || "2";

  //   console.log("🔍🔍🔍 WEBSOCKET STATUS CHECK");
  //   console.log("⏰ Check time:", new Date().toLocaleTimeString());
  //   console.log(
  //     "📡 Connection status:",
  //     webSocketService.isConnected() ? "CONNECTED ✅" : "DISCONNECTED ❌"
  //   );
  //   console.log("� Current user ID:", currentUserId);
  //   console.log(
  //     "🎯 Subscribed to: /user/" + currentUserId + "/queue/notification"
  //   );
  //   console.log("🔔 Waiting for messages from backend...");

  //   if (!webSocketService.isConnected()) {
  //     console.warn("⚠️ WebSocket is not connected! Attempting to reconnect...");
  //     const handleTestNotification = (data) => {
  //       console.log("✅ Test notification received:", data);
  //     };
  //     webSocketService.connect(currentUserId, handleTestNotification);
  //   } else {
  //     console.log("✅ WebSocket is ready to receive notifications!");
  //     console.log("💡 To trigger a real notification:");
  //     console.log(
  //       '   - Backend should call: messagingTemplate.convertAndSendToUser("' +
  //         currentUserId +
  //         '", "/queue/notification", notification)'
  //     );
  //     console.log("   - When you click ❤️ (like) button on a user card");
  //   }
  // };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching suitable users...");
        const response = await matchUserService.getUserSuitable();

        if (response && response.data && response.data.result) {
          const transformedUsers = transformUserData(response.data.result);
          console.log("✅ Users loaded:", transformedUsers);
          setUsers(transformedUsers);
          setTotalUsers(transformedUsers.length);

          // If no users from API, show no users message
          if (transformedUsers.length === 0) {
            setShowNoUsersMessage(true);
          }
        } else {
          console.error("❌ Invalid response format:", response);
          setUsers([]);
          setTotalUsers(0);
          setShowNoUsersMessage(true);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // ✅ Load unread match count ngay khi vào trang
    loadUnreadMatchCount();
  }, []);

  // Handle incoming chat messages via WebSocket
  useEffect(() => {
    const handleChatNotification = (event) => {
      const notificationData = event.detail;
      console.log("💬 CHAT notification received:", notificationData);

      if (notificationData.type === "CHAT") {
        const { senderId, senderName, content, matchId } = notificationData;

        // Format timestamp cho tin nhắn mới
        const formattedTime = new Date().toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const newChatMessage = {
          id: Date.now(),
          matchId: matchId,
          senderId: senderId,
          senderName: senderName,
          message: content,
          timestamp: formattedTime,
          isOwn: false, // Tin nhắn từ người khác
          read: false,
          sentAt: new Date().toISOString(),
        };

        // Update messages nếu đang xem chat của match này
        if (selectedMatch && selectedMatch.id === matchId) {
          setMessages((prev) => [...prev, newChatMessage]);

          // ✅ Tự động đánh dấu là đã đọc vì đang xem chat
          matchUserService
            .markMessagesAsRead(matchId)
            .then(() => {
              console.log("📖 Auto-marked new message as read (chat is open)");

              // ✅ Update state matches để sync isRead = true
              setMatches((prev) =>
                prev.map((m) =>
                  m.id === matchId
                    ? {
                        ...m,
                        lastMessage: content,
                        lastMessageTime: formattedTime,
                        unreadCount: 0,
                        isRead: true,
                      }
                    : m
                )
              );
            })
            .catch((error) => {
              console.error("❌ Error auto-marking as read:", error);
            });
        } else {
          // ✅ Nếu đã load matches list, update chi tiết
          if (matchesLoaded) {
            // Tìm match trước để check trạng thái
            const targetMatch = matches.find((m) => m.id === matchId);
            const shouldIncrementCount =
              targetMatch &&
              targetMatch.isRead &&
              targetMatch.unreadCount === 0;

            setMatches((prev) => {
              const updatedMatches = prev.map((match) => {
                if (match.id === matchId) {
                  return {
                    ...match,
                    lastMessage: content,
                    lastMessageTime: formattedTime,
                    unreadCount: (match.unreadCount || 0) + 1,
                    isRead: false,
                  };
                }
                return match;
              });

              return updatedMatches;
            });

            // ✅ Chỉ tăng count nếu match trước đó đã đọc hết
            // VÀ không phải đang xem match này
            if (shouldIncrementCount) {
              console.log("📊 COUNT++ Match was read, incrementing count");
              console.log("   Match ID:", matchId);
              console.log("   Target match state:", targetMatch);
              setTotalUnreadCount((prevCount) => {
                console.log("   Count change:", prevCount, "→", prevCount + 1);
                return prevCount + 1;
              });
            } else {
              console.log("📊 NOT incrementing count");
              console.log(
                "   Reason: Match already unread or currently viewing"
              );
              console.log("   Match ID:", matchId);
              console.log("   Target match state:", targetMatch);
              console.log("   shouldIncrementCount:", shouldIncrementCount);
            }
          } else {
            // ✅ Nếu CHƯA load matches (chưa click vào Messages tab)
            // → KHÔNG tăng count vì count đã bao gồm match này rồi
            console.log(
              "📊 NOT incrementing - Matches not loaded, count already includes unread matches"
            );
            console.log("   Match ID:", matchId);
            console.log("   Current count:", totalUnreadCount);
            console.log("   matchesLoaded:", matchesLoaded);
          }

          // Trigger hiệu ứng tin nhắn mới trên icon Messages
          setHasNewMessage(true);

          // Tự động tắt hiệu ứng sau 3 giây
          setTimeout(() => {
            setHasNewMessage(false);
          }, 3000);
        }
      }
    };

    // Lắng nghe custom event từ App.js cho CHAT notification
    window.addEventListener("chatNotification", handleChatNotification);

    return () => {
      window.removeEventListener("chatNotification", handleChatNotification);
    };
  }, [selectedMatch]);

  // Tự động tắt hiệu ứng khi không còn tin nhắn chưa đọc
  useEffect(() => {
    if (totalUnreadCount === 0) {
      setHasNewMessage(false);
    }
  }, [totalUnreadCount]);

  // Note: WebSocket is now handled globally in App.js
  // This ensures notifications work on ALL pages, not just Match page
  // useEffect(() => {
  //   console.log("📋 MATCH PAGE LOADED");
  //   console.log("🌍 WebSocket is handled globally in App.js");
  //   console.log("📢 Notifications will work on ANY page you're on!");
  //   console.log("🎯 When someone likes you → notification appears everywhere");

  //   if (!currentUserId) {
  //     console.warn("❌ No user ID found, WebSocket connection skipped");
  //     // For testing, let's use a default user ID
  //     const testUserId = "1";
  //     console.log("⚠️ Using test user ID:", testUserId);

  //     const handleNotification = (notificationData) => {
  //       console.log("+".repeat(60));
  //       console.log("🎯🎯🎯 MATCH.JS CALLBACK TRIGGERED! 🎯🎯🎯");
  //       console.log("+".repeat(60));
  //       console.log("📨 Received notification data:", notificationData);
  //       console.log("🔍 Notification type:", notificationData.type);
  //       console.log("⏰ Callback time:", new Date().toLocaleTimeString());

  //       if (notificationData.type === "MATCH") {
  //         console.log("💖💖💖 PROCESSING MATCH NOTIFICATION!");
  //         console.log("🔹 From:", notificationData.userFromUsername);
  //         notification.match(notificationData);
  //         console.log("✅ MATCH notification displayed!");
  //       } else if (notificationData.type === "LIKE") {
  //         console.log("👍👍👍 PROCESSING LIKE NOTIFICATION!");
  //         console.log("🔹 From:", notificationData.userFromUsername);
  //         notification.like(notificationData);
  //         console.log("✅ LIKE notification displayed!");
  //       } else {
  //         console.error(
  //           "❓❓❓ UNKNOWN NOTIFICATION TYPE:",
  //           notificationData.type
  //         );
  //         console.log("🔹 Available data:", Object.keys(notificationData));
  //       }

  //       console.log("+".repeat(60));
  //       console.log("🏁 MATCH.JS CALLBACK COMPLETE!");
  //       console.log("+".repeat(60));
  //     };

  //     // Connect with test user ID
  //     webSocketService.connect(testUserId, handleNotification);

  //     return () => {
  //       webSocketService.disconnect();
  //     };
  //   }

  //   const handleNotification = (notificationData) => {
  //     console.log("📨 Received notification:", notificationData);

  //     if (notificationData.type === "MATCH") {
  //       notification.match(notificationData);
  //     } else if (notificationData.type === "LIKE") {
  //       notification.like(notificationData);
  //     }
  //   };

  //   // Clear console for better debugging
  //   console.clear();

  //   console.log("=".repeat(80));
  //   console.log("🎯 TINDER APP - MATCH PAGE LOADED");
  //   console.log("=".repeat(80));
  //   console.log("⏰ Time:", new Date().toLocaleString());
  //   console.log("👤 Current User ID:", currentUserId);
  //   console.log("🌐 WebSocket URL: ws://localhost:8080/ws");
  //   console.log(
  //     "� Subscribe Path: /user/" + currentUserId + "/queue/notification"
  //   );
  //   console.log(
  //     '🎯 Expected Backend Messages From: messagingTemplate.convertAndSendToUser("' +
  //       currentUserId +
  //       '", "/queue/notification", data)'
  //   );
  //   console.log("=".repeat(80));

  //   console.log("�🔗🔗🔗 INITIALIZING WEBSOCKET CONNECTION");
  //   console.log("👤 User ID:", currentUserId);
  //   console.log("⏰ Connection time:", new Date().toLocaleTimeString());
  //   console.log("🎯 Callback function:", handleNotification.name);

  //   // Connect to WebSocket
  //   console.log("📡 Calling webSocketService.connect()...");
  //   webSocketService.connect(currentUserId, handleNotification);
  //   console.log("✅ WebSocket connection initiated!");
  //   console.log(
  //     "🔔 Waiting for notifications on /user/" +
  //       currentUserId +
  //       "/queue/notification"
  //   );

  //   console.log("📋 DEBUG INSTRUCTIONS:");
  //   console.log("1. Click 🎉 button to test MATCH notification");
  //   console.log("2. Click 💖 button to test LIKE notification");
  //   console.log("3. Click 🔍 button to check WebSocket status");
  //   console.log(
  //     "4. Use ❤️ or ❌ to trigger API calls that should send WebSocket messages"
  //   );
  //   console.log("=".repeat(80));

  //   // Cleanup on unmount
  //   return () => {
  //     console.log("🧹 CLEANING UP: Disconnecting WebSocket...");
  //     webSocketService.disconnect();
  //     console.log("✅ WebSocket cleanup complete!");
  //   };
  // }, []);

  // Handlers
  const handleLike = async () => {
    console.log("💗💗💗 HANDLE LIKE TRIGGERED!");
    console.log("👤 Current user:", currentUser?.name, "ID:", currentUser?.id);

    if (!currentUser) {
      console.error("❌ No current user to like!");
      return;
    }

    try {
      console.log("📡 Calling API to LIKE user...");
      console.log("🎯 Target user ID:", currentUser.id);
      console.log("📤 API call: likeUser(" + currentUser.id + ")");

      await matchUserService.likeUser(currentUser.id);

      console.log(`✅ LIKE API SUCCESS for user: ${currentUser.name}`);
      console.log("🔄 Removing current user from stack...");
      removeCurrentUser("👍 LIKED");
      console.log(
        "📢 LIKE ACTION COMPLETE - Waiting for WebSocket notification..."
      );
    } catch (error) {
      console.error("❌❌❌ ERROR LIKING USER:", error);
      console.error("🔍 Error details:", error.response?.data || error.message);
      // Still remove the card even if API fails
      removeCurrentUser("👍 LIKED");
    }
  };

  const handleDislike = async () => {
    console.log("👎👎👎 HANDLE DISLIKE TRIGGERED!");
    console.log("👤 Current user:", currentUser?.name, "ID:", currentUser?.id);

    if (!currentUser) {
      console.error("❌ No current user to dislike!");
      return;
    }

    try {
      console.log("📡 Calling API to DISLIKE user...");
      console.log("🎯 Target user ID:", currentUser.id);
      console.log("📤 API call: dislikeUser(" + currentUser.id + ")");

      await matchUserService.dislikeUser(currentUser.id);

      console.log(`✅ DISLIKE API SUCCESS for user: ${currentUser.name}`);
      console.log("🔄 Removing current user from stack...");
      removeCurrentUser("👎 DISLIKED");
      console.log("📢 DISLIKE ACTION COMPLETE!");
    } catch (error) {
      console.error("❌❌❌ ERROR DISLIKING USER:", error);
      console.error("🔍 Error details:", error.response?.data || error.message);
      // Still remove the card even if API fails
      removeCurrentUser("👎 DISLIKED");
    }
  };

  const handleSuperLike = async () => {
    if (!currentUser) return;

    try {
      // For now, treat super like same as regular like (status = 0)
      // You can create separate API endpoint for super like later
      await matchUserService.likeUser(currentUser.id);
      console.log(`✅ Super liked user: ${currentUser.name}`);
      removeCurrentUser("⭐ SUPER LIKED");
    } catch (error) {
      console.error("❌ Error super liking user:", error);
      // Still remove the card even if API fails
      removeCurrentUser("⭐ SUPER LIKED");
    }
  };

  // Test functions for debugging
  const testMatchNotification = () => {
    console.log("🧪🧪🧪 TESTING MATCH NOTIFICATION");
    console.log("⏰ Test time:", new Date().toLocaleTimeString());
    const mockData = {
      userFromId: 123,
      userFromUsername: "Test User",
      userToId: 456,
      userToUsername: "You",
      type: "MATCH",
    };
    console.log("📤 Mock MATCH data:", mockData);
    console.log("🔄 Test MATCH notification (no popup)...");
    console.log("✅ Test MATCH notification complete!");
  };

  const testLikeNotification = () => {
    console.log("🧪🧪🧪 TESTING LIKE NOTIFICATION");
    console.log("⏰ Test time:", new Date().toLocaleTimeString());
    const mockData = {
      userFromId: 789,
      userFromUsername: "Another User",
      type: "LIKE",
    };
    console.log("📤 Mock LIKE data:", mockData);
    console.log("🔄 Test LIKE notification (no popup)...");
    console.log("✅ Test LIKE notification complete!");
  };

  // Test function cho hiệu ứng tin nhắn mới
  const testMessageNotification = () => {
    console.log("🧪💬 TESTING MESSAGE NOTIFICATION EFFECT");
    setTotalUnreadCount((prev) => prev + 1);
    setHasNewMessage(true);

    // Tự động tắt sau 3 giây
    setTimeout(() => {
      setHasNewMessage(false);
    }, 3000);

    console.log("✅ Test message effect triggered!");
  };

  // Expose test function to window for debugging
  if (typeof window !== "undefined") {
    window.testMessageEffect = testMessageNotification;
  }

  const showDetailsModal = () => {
    setShowDetail(true);
  };

  // Helper function to remove user and handle index management
  const removeCurrentUser = (action) => {
    const currentUser = users[currentCardIndex];

    if (!currentUser) return;

    const remainingCount = users.length - 1;
    console.log(`${action} user: ${currentUser.name} (ID: ${currentUser.id})`);
    console.log(`📊 Remaining users: ${remainingCount}/${totalUsers}`);

    // Remove the current user from the array
    const updatedUsers = users.filter((_, index) => index !== currentCardIndex);
    setUsers(updatedUsers);

    // If we removed the last user and there are still users left,
    // move to the previous index to show the new "last" user
    if (currentCardIndex >= updatedUsers.length && updatedUsers.length > 0) {
      setCurrentCardIndex(updatedUsers.length - 1);
    }

    // Close detail view if it was open
    setShowDetail(false);

    // Show completion message if no more users
    if (updatedUsers.length === 0) {
      console.log("🎉 All users processed!");
      setShowNoUsersMessage(true);
    }
  };

  // Current user
  const currentUser = users[currentCardIndex];

  return (
    <div className="match-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="overlay-backdrop">
          <div className="overlay-content">
            <div className="loading-spinner"></div>
            <h2>Đang tìm kiếm...</h2>
            <p>Chúng tôi đang tìm những người phù hợp với bạn trong khu vực</p>
          </div>
        </div>
      )}

      {/* Backdrop overlay when in detail mode */}
      {showDetail && (
        <div className="detail-backdrop" onClick={() => setShowDetail(false)} />
      )}

      <div className="match-content">
        {/* Task Bar Left */}
        <div className="task-bar-left">
          <div className="task-bar-items">
            <div className="task-item active" title="Discover">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4458">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <div
              className="task-item"
              title="Explore"
              onClick={() => navigate("/explore")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>

            <div
              className={`task-item ${showMessagesOverlay ? "active" : ""} ${
                hasNewMessage ? "new-message-pulse" : ""
              } ${totalUnreadCount > 0 ? "has-unread-messages" : ""}`}
              title="Messages"
              onClick={() => {
                setShowMessagesOverlay(!showMessagesOverlay);
                setHasNewMessage(false); // Tắt hiệu ứng khi click vào Messages
                if (!showMessagesOverlay) {
                  loadMatches();
                }
              }}
              style={{ position: "relative" }}
            >
              {/* Ring effect when new message arrives */}
              {hasNewMessage && <div className="message-ring-effect"></div>}

              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={
                  showMessagesOverlay
                    ? "#ff4458"
                    : totalUnreadCount > 0
                    ? "#ff6b7a"
                    : "#ccc"
                }
                className={hasNewMessage ? "message-icon-bounce" : ""}
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>

              {totalUnreadCount > 0 && (
                <Badge
                  count={totalUnreadCount}
                  size="small"
                  className={hasNewMessage ? "badge-bounce" : ""}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                  }}
                />
              )}
            </div>

            <div
              className={`task-item ${showLikesOverlay ? "active" : ""}`}
              title="Likes"
              onClick={() => {
                setShowLikesOverlay(!showLikesOverlay);
                if (!showLikesOverlay) {
                  loadUsersWhoLikedMe();
                }
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={showLikesOverlay ? "#ff4458" : "#ccc"}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <div
              className="task-item"
              title="Super Likes"
              onClick={() => navigate("/super-likes")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>

          <div className="task-bar-bottom">
            <div
              className="task-item"
              title="Settings"
              onClick={() => navigate("/settings")}
            >
              <SettingOutlined style={{ fontSize: "24px", color: "#ccc" }} />
            </div>

            <div className="task-item" title="Logout" onClick={handleLogout}>
              <CloseOutlined style={{ fontSize: "20px", color: "#ccc" }} />
            </div>

            <div
              className="task-item"
              title="Profile"
              onClick={() => navigate("/profile")}
            >
              <Avatar
                size={32}
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
              />
            </div>
          </div>
        </div>

        {/* Card Stack */}
        <div className="card-stack">
          {/* Background Cards */}
          {currentCardIndex + 1 < users.length && (
            <div className="background-card card-1">
              <TinderCard
                user={users[currentCardIndex + 1]}
                onLike={() => {}}
                onDislike={() => {}}
                onSuperLike={() => {}}
                onShowDetails={() => {}}
              />
            </div>
          )}

          {currentCardIndex + 2 < users.length && (
            <div className="background-card card-2">
              <TinderCard
                user={users[currentCardIndex + 2]}
                onLike={() => {}}
                onDislike={() => {}}
                onSuperLike={() => {}}
                onShowDetails={() => {}}
              />
            </div>
          )}

          {/* Main Card */}
          <div className={`main-card ${showDetail ? "detail-mode" : ""}`}>
            {currentUser ? (
              <TinderCard
                user={currentUser}
                onLike={handleLike}
                onDislike={handleDislike}
                onSuperLike={handleSuperLike}
                onShowDetails={showDetailsModal}
                scrollMode={showDetail}
              />
            ) : (
              <div className="empty-card">
                <div className="empty-card-content">
                  <div className="empty-icon">💫</div>
                  <h3>Đang chờ...</h3>
                  <p>Sẵn sàng khám phá những người mới</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-items">
          <div className="nav-item active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4458">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Discover</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/messages")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span>Messages</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/profile")}>
            <RightOutlined style={{ fontSize: "24px", color: "#ccc" }} />
            <span>Profile</span>
          </div>
        </div>
      </div>

      {/* Likes Overlay */}
      {showLikesOverlay && (
        <div className="likes-overlay">
          <div className="likes-container">
            {/* Header */}
            <div className="likes-header">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => setShowLikesOverlay(false)}
                className="likes-back-btn"
              />
              <Typography.Title level={4} className="likes-title">
                Users Who Liked You
              </Typography.Title>
              <div style={{ width: 32 }} />
            </div>

            {/* Content */}
            <div className="likes-content">
              {likesLoading ? (
                <div className="likes-loading">
                  <Spin size="large" />
                  <Typography.Text>Loading...</Typography.Text>
                </div>
              ) : usersWhoLikedMe.length === 0 ? (
                <div className="likes-empty">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No one has liked you yet"
                  />
                </div>
              ) : (
                <Row gutter={[16, 16]} className="likes-grid">
                  {usersWhoLikedMe.map((user, index) => (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      key={user.userId || index}
                    >
                      <Card
                        hoverable
                        className="like-card"
                        cover={
                          <div className="like-card-image">
                            <img
                              alt={user.fullName}
                              src={
                                user.imagesList?.[0] ||
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNNjAgMTQwQzYwIDEyMC45IDc1LjkgMTA1IDk1IDEwNUgxMDVDMTI0LjEgMTA1IDE0MCAxMjAuOSAxNDAgMTQwVjE2MEg2MFYxNDBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo="
                              }
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div className="like-card-overlay">
                              <Button
                                type="primary"
                                shape="round"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowUserDetail(user);
                                }}
                                className="view-detail-btn"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        }
                        onClick={() => handleShowUserDetail(user)}
                      >
                        <Card.Meta
                          title={
                            <div className="like-card-title">
                              <span>{user.fullName}</span>
                              <span className="like-card-age">{user.age}</span>
                            </div>
                          }
                          description={
                            <div className="like-card-description">
                              <Typography.Text type="secondary">
                                📍{" "}
                                {user.distanceKm
                                  ? `${user.distanceKm.toFixed(1)} km away`
                                  : "Unknown distance"}
                              </Typography.Text>
                              {user.bio && (
                                <Typography.Text
                                  className="like-card-bio"
                                  ellipsis
                                >
                                  {user.bio}
                                </Typography.Text>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Users Overlay - positioned inside match-content to not block taskbar */}
      {showNoUsersMessage && !loading && (
        <div className="no-users-overlay">
          <div className="no-users-content">
            <div className="no-users-icon">📍</div>
            <h2>Hết người trong khoảng cách này!</h2>
            <p>Trong khoảng cách hiện tại đã hết người phù hợp.</p>
            <p>Bạn cần điều chỉnh lại khoảng cách để tìm thêm người mới.</p>
            <div className="overlay-buttons">
              <Button
                type="primary"
                onClick={() => navigate("/settings")}
                style={{
                  background:
                    "linear-gradient(135deg, #ff4458 0%, #ff6b7a 100%)",
                  border: "none",
                  marginRight: "12px",
                }}
              >
                Điều chỉnh khoảng cách
              </Button>
              <Button
                type="default"
                onClick={() => {
                  setShowNoUsersMessage(false);
                  window.location.reload();
                }}
              >
                Tải lại
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Overlay */}
      {showMessagesOverlay && (
        <div className="messages-overlay">
          <div className="messages-container">
            {/* Header */}
            <div className="messages-header">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => {
                  setShowMessagesOverlay(false);
                  setSelectedMatch(null);
                }}
                className="messages-back-btn"
              />
              <Typography.Title level={4} className="messages-title">
                Messages
              </Typography.Title>
              <div style={{ width: 32 }} />
            </div>

            {/* Content */}
            <div className="messages-content">
              {messagesLoading ? (
                <div className="messages-loading">
                  <Spin size="large" />
                  <Typography.Text>Loading matches...</Typography.Text>
                </div>
              ) : (
                <div className="messages-layout">
                  {/* Matches List */}
                  <div
                    className={`matches-list ${
                      selectedMatch ? "with-chat" : ""
                    }`}
                  >
                    {matches.length === 0 ? (
                      <div className="matches-empty">
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No matches yet"
                        />
                      </div>
                    ) : (
                      <List
                        dataSource={matches}
                        renderItem={(match) => (
                          <List.Item
                            className={`match-item ${
                              selectedMatch?.id === match.id ? "selected" : ""
                            } ${match.unreadCount > 0 ? "has-unread" : ""}`}
                            onClick={() => handleMatchSelect(match)}
                          >
                            <List.Item.Meta
                              avatar={
                                <Badge count={match.unreadCount} size="small">
                                  <Avatar size={50} src={match.avatar} />
                                </Badge>
                              }
                              title={
                                <span className="match-name">
                                  {match.fullName}
                                </span>
                              }
                              description={
                                <div className="match-message">
                                  <span className="last-message">
                                    {match.lastMessage}
                                  </span>
                                  <span className="message-time">
                                    {match.lastMessageTime}
                                  </span>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </div>

                  {/* Chat Area */}
                  {selectedMatch && (
                    <div className="chat-area">
                      {/* Chat Header */}
                      <div className="chat-header">
                        <Avatar size={40} src={selectedMatch.avatar} />
                        <div className="chat-user-info">
                          <Typography.Text strong>
                            {selectedMatch.fullName}
                          </Typography.Text>
                          <Typography.Text
                            type="secondary"
                            className="chat-status"
                          >
                            Online
                          </Typography.Text>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="chat-messages">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`message ${
                              message.isOwn ? "own" : "other"
                            }`}
                          >
                            <div className="message-bubble">
                              <span className="message-text">
                                {message.message}
                              </span>
                              <span className="message-timestamp">
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="chat-input">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onPressEnter={handleSendMessage}
                          suffix={
                            <Button
                              type="text"
                              icon={<SendOutlined />}
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                            />
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <Modal
        title={null}
        open={showUserModal}
        onCancel={() => setShowUserModal(false)}
        footer={null}
        width={400}
        className="user-detail-modal"
        centered
        getContainer={false}
        zIndex={3000}
      >
        {selectedUser && (
          <div className="user-detail-content">
            {/* User Images Carousel */}
            <div className="user-detail-images">
              {selectedUser.imagesList && selectedUser.imagesList.length > 0 ? (
                <div className="image-carousel">
                  <img
                    src={selectedUser.imagesList[0]}
                    alt={selectedUser.fullName}
                    className="main-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {selectedUser.imagesList.length > 1 && (
                    <div className="image-indicators">
                      {selectedUser.imagesList.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${index === 0 ? "active" : ""}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-image-placeholder">
                  <div className="placeholder-icon">👤</div>
                  <span>No Image</span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="user-detail-info">
              <div className="user-basic-info">
                <Typography.Title level={3} className="user-name">
                  {selectedUser.fullName}
                  <span className="user-age">, {selectedUser.age}</span>
                </Typography.Title>

                <div className="user-location">
                  <Typography.Text type="secondary">
                    📍{" "}
                    {selectedUser.distanceKm
                      ? `${selectedUser.distanceKm.toFixed(1)} km away`
                      : "Unknown distance"}
                  </Typography.Text>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="user-bio">
                  <Typography.Paragraph>
                    {selectedUser.bio}
                  </Typography.Paragraph>
                </div>
              )}

              {/* Additional Info */}
              <div className="user-additional-info">
                {selectedUser.company && (
                  <div className="info-item">
                    <Typography.Text strong>🏢 Company: </Typography.Text>
                    <Typography.Text>{selectedUser.company}</Typography.Text>
                  </div>
                )}

                {selectedUser.school && (
                  <div className="info-item">
                    <Typography.Text strong>🎓 School: </Typography.Text>
                    <Typography.Text>{selectedUser.school}</Typography.Text>
                  </div>
                )}

                {selectedUser.tall && (
                  <div className="info-item">
                    <Typography.Text strong>📏 Height: </Typography.Text>
                    <Typography.Text>{selectedUser.tall} cm</Typography.Text>
                  </div>
                )}

                {selectedUser.location && (
                  <div className="info-item">
                    <Typography.Text strong>🏠 Location: </Typography.Text>
                    <Typography.Text>{selectedUser.location}</Typography.Text>
                  </div>
                )}
              </div>

              {/* Interests */}
              {selectedUser.interestsList &&
                selectedUser.interestsList.length > 0 && (
                  <div className="user-interests">
                    <Typography.Text strong>💫 Interests:</Typography.Text>
                    <div className="interests-tags">
                      {selectedUser.interestsList.map((interest, index) => (
                        <span key={index} className="interest-tag">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="user-detail-actions">
                <Button
                  type="default"
                  size="large"
                  icon="❌"
                  className="reject-btn"
                  onClick={() => setShowUserModal(false)}
                >
                  Pass
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon="💖"
                  className="like-btn"
                  onClick={() => handleLikeBack(selectedUser)}
                >
                  Like Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Match;
