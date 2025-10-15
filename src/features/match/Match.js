import React, { useState } from 'react';
import { Button, Avatar } from 'antd';
import {
  MessageOutlined,
  ProfileOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  EyeInvisibleOutlined,
  HeartFilled,
  CloseOutlined,
  StarFilled
} from '@ant-design/icons';
import TinderCard from './TinderCard';
import { useNavigate } from 'react-router-dom';
import './Match.css';

const Match = () => {
  const navigate = useNavigate();

  // Sample data
  const users = [
    {
      id: 1,
      name: 'Emma',
      age: 24,
      distance: '2 km away',
      images: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face'
      ],
      bio: "Love traveling and trying new foods 🌎✈️",
      company: "Marketing at Tech Corp",
      school: "NYU",
      interests: ["Travel", "Photography", "Food"],
      verified: true
    },
    {
      id: 2,
      name: 'Sarah',
      age: 22,
      distance: '5 km away',
      images: [
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400&h=600&fit=crop&crop=face'
      ],
      bio: "Dog lover 🐕 Yoga enthusiast 🧘‍♀️",
      company: "Designer at Creative Studio",
      school: "UCLA",
      interests: ["Yoga", "Dogs", "Art"],
      verified: false
    },
    {
      id: 3,
      name: 'Jessica',
      age: 26,
      distance: '3 km away',
      images: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&h=600&fit=crop&crop=face'
      ],
      bio: "Coffee addict ☕ Book worm 📚",
      company: "Software Engineer",
      school: "MIT",
      interests: ["Reading", "Coffee", "Tech"],
      verified: true
    }
  ];

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  const currentUser = users[currentCardIndex];

  // Handlers
  const handleLike = () => {
    if (currentCardIndex < users.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleDislike = () => {
    if (currentCardIndex < users.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleSuperLike = () => {
    console.log('Super Like!');
    if (currentCardIndex < users.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const showDetailsModal = () => {
    setShowDetail(true);
  };

  if (!currentUser) {
    return (
      <div className="match-container">
        <div className="no-more-users">
          <h2>No more people in your area!</h2>
          <p>Expand your discovery settings to see more people.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-container">
      {/* Backdrop overlay when in detail mode */}
      {showDetail && (
        <div 
          className="detail-backdrop" 
          onClick={() => setShowDetail(false)}
        />
      )}

      <div className="match-content">
        {/* Task Bar Left */}
        <div className="task-bar-left">
          <div className="task-bar-items">
            <div className="task-item active" title="Discover">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4458">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            
            <div className="task-item" title="Explore" onClick={() => navigate('/explore')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <div className="task-item" title="Messages" onClick={() => navigate('/messages')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            
            <div className="task-item" title="Likes" onClick={() => navigate('/likes')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            
            <div className="task-item" title="Super Likes" onClick={() => navigate('/super-likes')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
          </div>
          
          <div className="task-bar-bottom">
            <div className="task-item" title="Settings" onClick={() => navigate('/settings')}>
              <SettingOutlined style={{ fontSize: '24px', color: '#ccc' }} />
            </div>
            
            <div className="task-item" title="Profile" onClick={() => navigate('/profile')}>
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
          <div className={`main-card ${showDetail ? 'detail-mode' : ''}`}>
            <TinderCard
              user={currentUser}
              onLike={handleLike}
              onDislike={handleDislike}
              onSuperLike={handleSuperLike}
              onShowDetails={showDetailsModal}
              scrollMode={showDetail}
            />
            
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
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Discover</span>
          </div>
          
          <div className="nav-item" onClick={() => navigate('/messages')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Messages</span>
          </div>
          
          <div className="nav-item" onClick={() => navigate('/profile')}>
            <RightOutlined style={{ fontSize: '24px', color: '#ccc' }} />
            <span>Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Match;