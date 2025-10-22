import React, { useState, useEffect } from "react";
import { Button, Avatar } from "antd";
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
} from "@ant-design/icons";
import TinderCard from "./TinderCard";
import { useNavigate } from "react-router-dom";
import matchUserService from "../../api/userService/matchUser";
import "./Match.css";

const Match = () => {
  const navigate = useNavigate();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0); // Track original count
  const [showNoUsersMessage, setShowNoUsersMessage] = useState(false); // Show no users overlay

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
  }, []);

  // Handlers
  const handleLike = () => {
    removeCurrentUser("👍 LIKED");

    // Optional: Add like-specific API call here
    // Example: await likeUserAPI(currentUser.id);
  };

  const handleDislike = () => {
    removeCurrentUser("👎 DISLIKED");

    // Optional: Add dislike-specific API call here
    // Example: await dislikeUserAPI(currentUser.id);
  };

  const handleSuperLike = () => {
    removeCurrentUser("⭐ SUPER LIKED");

    // Optional: Add super like-specific API call here
    // Example: await superLikeUserAPI(currentUser.id);
  };

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

      {/* No Users Overlay */}
      {showNoUsersMessage && !loading && (
        <div className="overlay-backdrop">
          <div className="overlay-content">
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
              className="task-item"
              title="Messages"
              onClick={() => navigate("/messages")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>

            <div
              className="task-item"
              title="Likes"
              onClick={() => navigate("/likes")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
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

            {/* Close detail button when in detail mode */}
            {showDetail && (
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => setShowDetail(false)}
                className="close-detail-btn"
              />
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
    </div>
  );
};

export default Match;
