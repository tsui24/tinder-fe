import React, { useState } from "react";
import {
  HeartFilled,
  CloseOutlined,
  StarFilled,
  UndoOutlined,
  ThunderboltFilled,
  InfoCircleOutlined,
  EnvironmentOutlined,
  BookOutlined,
  ManOutlined,
  BulbOutlined,
  UserOutlined,
  FireOutlined,
} from "@ant-design/icons";
import "./TinderCard.css";

const TinderCard = ({ user, onLike, onDislike, onSuperLike, onShowDetails, scrollMode = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleTapLeft = (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleTapRight = (e) => {
    e.stopPropagation();
    if (currentImageIndex < user.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div className={`tinder-card ${scrollMode ? 'scroll-mode' : ''}`}>
      {/* Main card image */}
      <div className="tinder-card-image-container">
        <img
          src={user.images[currentImageIndex]}
          alt={user.name}
          className="tinder-card-image"
        />
        
        {/* Tap zones for navigation */}
        <div className="tap-zone tap-left" onClick={handleTapLeft} />
        <div className="tap-zone tap-right" onClick={handleTapRight} />
        
        {/* Photo progress bars */}
        <div className="photo-progress-bars">
          {user.images.map((_, index) => (
            <div
              key={index}
              className={`progress-bar ${index === currentImageIndex ? 'active' : index < currentImageIndex ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        {/* Profile info button */}
        <button 
          className="profile-info-button"
          onClick={(e) => {
            e.stopPropagation();
            onShowDetails();
          }}
        >
          <InfoCircleOutlined />
        </button>
        
        {/* User info overlay */}
        <div className="user-info-overlay">
          <div className="user-basic-info">
            <div className="user-name-age">
              <span className="user-name">{user.name}</span>
              <span className="user-age">{user.age}</span>
            </div>
            <div className="user-distance">
              <EnvironmentOutlined />
              <span>{user.distance} kilometers away</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="tinder-action-buttons">
        <button className="action-button rewind-button">
          <UndoOutlined />
        </button>
        
        <button 
          className="action-button pass-button"
          onClick={(e) => {
            e.stopPropagation();
            onDislike();
          }}
        >
          <CloseOutlined />
        </button>
        
        <button 
          className="action-button super-like-button"
          onClick={(e) => {
            e.stopPropagation();
            onSuperLike();
          }}
        >
          <StarFilled />
        </button>
        
        <button 
          className="action-button like-button"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
        >
          <HeartFilled />
        </button>
        
        <button className="action-button boost-button">
          <ThunderboltFilled />
        </button>
      </div>
      
      {/* Scrollable content for detail view */}
      {scrollMode && (
        <div className="scroll-content">
          <div className="scroll-section">
            <h3>About {user.name}</h3>
            <p>{user.bio}</p>
          </div>
          
          <div className="scroll-section">
            <h4><ManOutlined /> Basic Info</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{user.age}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Distance</span>
                <span className="info-value">{user.distance}</span>
              </div>
            </div>
          </div>
          
          <div className="scroll-section">
            <h4><BookOutlined /> Work & Education</h4>
            <div className="info-item">
              <span className="info-label">Job</span>
              <span className="info-value">{user.company}</span>
            </div>
            <div className="info-item">
              <span className="info-label">School</span>
              <span className="info-value">{user.school}</span>
            </div>
          </div>
          
          <div className="scroll-section">
            <h4><BulbOutlined /> Interests</h4>
            <div className="interests-grid">
              {user.interests.map((interest, index) => (
                <span key={index} className="interest-bubble">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          <div className="scroll-section">
            <h4><UserOutlined /> More Photos</h4>
            <div className="photo-grid">
              {user.images.map((image, index) => (
                <div key={index} className="photo-item">
                  <img src={image} alt={`${user.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="scroll-section">
            <h4><FireOutlined /> Passions</h4>
            <div className="passions-grid">
              <span className="passion-tag">🎵 Music</span>
              <span className="passion-tag">🏃‍♀️ Fitness</span>
              <span className="passion-tag">🍕 Food</span>
              <span className="passion-tag">🎨 Art</span>
              <span className="passion-tag">📚 Reading</span>
              <span className="passion-tag">✈️ Travel</span>
            </div>
          </div>
          
          <div className="scroll-section">
            <div className="verification-badge">
              {user.verified && (
                <span className="verified-text">
                  ✓ Photo Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TinderCard;