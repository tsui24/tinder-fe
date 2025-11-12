import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
  Divider,
  Upload,
  Image,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LeftOutlined,
  CalendarOutlined,
  MailOutlined,
  HomeOutlined,
  BankOutlined,
  HeartOutlined,
  PlusOutlined,
  CameraOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import matchUserService from "../../api/userService/matchUser";
import { getCurrentUserId } from "../../utils/auth";
import moment from "moment";
import { supabase } from "../../config/supabaseClient";
import "./Profile.css";
import imageService from "../../api/userService/images";
import notification from "../../utils/notification";
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const [userPhotos, setUserPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newImages, setNewImages] = useState([]); // Track new images to upload
  const [deletedImages, setDeletedImages] = useState([]); // Track deleted image URLs
  const [hasImageChanges, setHasImageChanges] = useState(false);
  // Change password modal state
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm] = Form.useForm();

  // Upload ảnh lên Supabase
  const uploadToSupabase = async (file) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Lấy public URL
      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Không thể lấy public URL");
      }

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error("Lỗi upload:", error);
      throw error;
    }
  };

  // Open change password modal
  const openChangePasswordModal = () => {
    passwordForm.resetFields();
    setChangePasswordModalVisible(true);
  };

  // Handle change password
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const { currentPassword, newPassword, confirmPassword } = values;

      if (newPassword !== confirmPassword) {
        message.error("New password and confirm password do not match!");
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        message.error("New password must be at least 6 characters long.");
        return;
      }

      setChangingPassword(true);
      console.log("🔐 Changing password...");

      // Payload must match ChangePassRequest: { oldPassword, newPassword }
      const payload = {
        oldPassword: currentPassword,
        newPassword: newPassword,
      };

      const resp = await matchUserService.updatePassword(payload);
      console.log("✅ Change password response:", resp);

      // Backend returns { code, message, result }
      const code = resp?.data?.code ?? resp?.status;
      const serverMessage =
        resp?.data?.message || resp?.data?.msg || resp?.statusText;
      if (code === 200) {
        setChangePasswordModalVisible(false);
        passwordForm.resetFields();
        notification.success("Password changed successfully!");
      } else {
        // Show server-provided message when code != 200
        notification.error(resp.data?.message || serverMessage);
      }
    } catch (error) {
      console.error("❌ Error changing password:", error);
      notification.error(
        error?.response?.data?.message ||
          error?.message ||
          "Change password failed"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Load user profile data
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      console.log("🔍 Loading profile for user ID:", userId);

      if (!userId) {
        console.error("❌ No user ID found");
        navigate("/login");
        return;
      }

      console.log("📡 Calling API: matchUserService.getUserProfile()");
      const response = await matchUserService.getUserProfile();
      console.log("✅ RAW Profile API Response:", response);
      console.log("✅ Response type:", typeof response);
      console.log(
        "✅ Response keys:",
        response ? Object.keys(response) : "no response"
      );

      // Handle different response structures
      let profileData = null;
      if (response?.data?.result) {
        // If response has nested structure: { data: { result: {...} } }
        profileData = response.data.result;
      } else if (response?.result) {
        // If response has direct result: { code, message, result: {...} }
        profileData = response.result;
      } else if (response?.data) {
        // If response has direct data: { data: {...} }
        profileData = response.data;
      } else if (response) {
        // If response is direct data: {...}
        profileData = response;
      }

      // Load user photos
      if (profileData?.images) {
        console.log("📷 Raw images from API:", profileData.images);
        // Convert image URLs to photo objects, filter out null/empty
        const validImages = profileData.images
          .filter((imgUrl) => {
            const isValid =
              imgUrl != null && imgUrl !== "" && typeof imgUrl === "string";
            if (!isValid) console.log("❌ Filtered out invalid image:", imgUrl);
            return isValid;
          })
          .map((imageUrl, index) => ({
            id: `existing_${index}`,
            imageUrl: imageUrl,
            isNew: false,
          }));
        console.log("📷 Valid converted photo objects:", validImages);
        setUserPhotos(validImages);
      }

      console.log("📋 Processed profile data:", profileData);
      console.log("📋 Profile data type:", typeof profileData);
      console.log(
        "📋 Profile data keys:",
        profileData ? Object.keys(profileData) : "no data"
      );

      if (profileData) {
        console.log("🎯 Setting userProfile state with:", profileData);
        setUserProfile(profileData);

        // Map API fields to form fields with fallbacks
        const birthDayValue =
          profileData.birthday || profileData.birthDay || profileData.birth_day;
        console.log("🗓️ Raw birthDay value:", birthDayValue);

        const formData = {
          fullName: profileData.fullName || profileData.full_name || "",
          email: profileData.email || "",
          gender: profileData.gender || "",
          birthDay: birthDayValue ? moment(birthDayValue, "YYYY-MM-DD") : null,
          tall: profileData.tall || profileData.height || "",
          school: profileData.school || "",
          company: profileData.company || "",
          bio: profileData.bio || profileData.description || "",
          username: profileData.username || "",
        };

        console.log("🗓️ Parsed birthDay moment:", formData.birthDay);
        console.log(
          "🗓️ Formatted birthDay:",
          formData.birthDay ? formData.birthDay.format("DD/MM/YYYY") : "null"
        );

        console.log("📝 Form data mapped:", formData);
        form.setFieldsValue(formData);
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
      console.error("❌ Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      if (error?.response?.status === 401) {
        message.error("Login session expired!");
        navigate("/login");
      } else if (error?.response?.status === 404) {
        message.error("User information not found!");
      } else {
        message.error("Unable to load user information!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (values) => {
    try {
      setUpdating(true);
      console.log("🔄 Updating profile with form values:", values);

      // Format data according to API expectations
      const apiPayload = {
        fullName: values.fullName || "",
        email: values.email || "",
        gender: values.gender || "",
        birthDay: values.birthDay ? values.birthDay.format("YYYY-MM-DD") : null,
        tall: values.tall ? parseInt(values.tall) : null,
        school: values.school || "",
        company: values.company || "",
        bio: values.bio || "",
      };

      // Remove null/empty values
      Object.keys(apiPayload).forEach((key) => {
        if (apiPayload[key] === null || apiPayload[key] === "") {
          delete apiPayload[key];
        }
      });

      console.log("📤 API payload prepared:", apiPayload);

      const response = await matchUserService.updateUserProfile(apiPayload);
      console.log("✅ Profile update response:", response);

      // Check if update was successful
      if (response?.data || response?.status === 200 || response) {
        message.success("Profile updated successfully!");
        setEditModalVisible(false);
        await loadUserProfile(); // Reload fresh data
      } else {
        message.error("Update failed!");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      console.error("❌ Update error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      if (error?.response?.status === 400) {
        message.error("Invalid data!");
      } else if (error?.response?.status === 401) {
        message.error("Login session expired!");
        navigate("/login");
      } else {
        message.error("Error updating information!");
      }
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    // Mock data for testing photo gallery
  }, []);

  // Calculate age from birthday
  const calculateAge = (birthDay) => {
    if (!birthDay) return null;
    return moment().diff(moment(birthDay), "years");
  };

  // Format gender display
  const formatGender = (gender) => {
    const genderMap = {
      1: "Male",
      0: "Female",
      2: "Other",
      1: "Male",
      0: "Female",
      2: "Other",
    };
    return genderMap[gender] || "Unknown";
  };

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    try {
      // Check file limits
      if (userPhotos.length >= 6) {
        message.error("You can upload maximum 6 photos!");
        return false;
      }

      // Validate file type
      const isValidImage =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isValidImage) {
        message.error("Only JPG/PNG files are allowed!");
        return false;
      }

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      const tempId = `temp_${Date.now()}`;

      const newPhoto = {
        id: tempId,
        imageUrl: previewUrl,
        isNew: true,
        file: file,
      };

      // Add to photos for immediate preview
      setUserPhotos((prev) => [...prev, newPhoto]);

      // Track as new image to be uploaded later
      setNewImages((prev) => [
        ...prev,
        {
          imageUrl: previewUrl,
          file: file,
          tempId: tempId,
        },
      ]);

      setHasImageChanges(true);
      message.success("Photo added! Click 'Save Changes' to upload.");
    } catch (error) {
      console.error("❌ Error adding photo:", error);
      message.error("Error adding photo!");
    }

    return false; // Prevent default upload behavior
  };

  // Handle photo delete
  const handleDeletePhoto = (photoId) => {
    const photoToDelete = userPhotos.find((photo) => photo.id === photoId);

    if (photoToDelete) {
      console.log("🗑️ Deleting photo:", photoToDelete);

      // Remove from current photos
      setUserPhotos((prev) => prev.filter((photo) => photo.id !== photoId));

      if (photoToDelete.isNew) {
        // If it's a new photo, just remove from newImages
        console.log("➡️ Removing new photo from newImages");
        setNewImages((prev) => prev.filter((img) => img.tempId !== photoId));
      } else {
        // If it's an existing photo, track for deletion
        const photoUrl = photoToDelete.imageUrl;
        console.log("➡️ Adding existing photo URL to deletedImages:", photoUrl);
        setDeletedImages((prev) => {
          const newDeleted = [...prev, photoUrl];
          console.log("🗑️ Updated deletedImages:", newDeleted);
          return newDeleted;
        });
      }

      setHasImageChanges(true);
      message.success("Photo removed! Click 'Save Changes' to confirm.");
    }
  };

  // Save image changes to server
  const handleSaveImageChanges = async () => {
    if (!hasImageChanges) {
      message.info("No image changes to save!");
      return;
    }

    setUploadingPhoto(true);
    try {
      console.log("📤 Saving image changes...");
      console.log("🆕 New images to upload:", newImages);
      console.log("🗑️ Images to delete:", deletedImages);

      // 1️⃣ Upload tất cả ảnh mới lên Supabase
      let newImageUrls = [];
      if (newImages.length > 0) {
        console.log("🔄 Uploading new images to Supabase...");
        const uploadPromises = newImages.map((imgObj) =>
          uploadToSupabase(imgObj.file)
        );
        const uploadResults = await Promise.all(uploadPromises);
        newImageUrls = uploadResults.map((result) => result.url);
        console.log("✅ New images uploaded:", newImageUrls);
      }

      // 2️⃣ Prepare API payload - send URLs directly
      const imageUpdatePayload = {
        newImages: newImageUrls, // Gửi URLs trực tiếp từ Supabase
        deletedImages: deletedImages, // URLs của ảnh cần xóa
      };

      console.log("📡 Final imageUpdatePayload:", imageUpdatePayload);
      console.log("📡 New images count:", newImageUrls.length);
      console.log("📡 New images URLs:", newImageUrls);
      console.log("📡 Deleted images count:", deletedImages.length);
      console.log("📡 Deleted images URLs:", deletedImages);

      // 3️⃣ Call API
      const response = await imageService.updateUserImages(imageUpdatePayload);

      if (response) {
        message.success("Images updated successfully!");

        // Reset tracking states
        setNewImages([]);
        setDeletedImages([]);
        setHasImageChanges(false);

        // Reload profile to get fresh data
        await loadUserProfile();
      }
    } catch (error) {
      console.error("❌ Error updating images:", error);
      message.error("Error updating images! " + error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get avatar URL (first photo or default)
  const getAvatarUrl = () => {
    if (userPhotos.length > 0) {
      return userPhotos[0].imageUrl;
    }
    return userProfile?.images?.[0] || null;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
        <p>Loading profile information...</p>
      </div>
    );
  }

  if (!userProfile) {
    console.log("❌ RENDER: userProfile is null/undefined");
    return (
      <div className="profile-error">
        <Title level={4}>Unable to load user information</Title>
        <Button onClick={() => navigate("/match")}>Go back</Button>
      </div>
    );
  }

  console.log("🎨 RENDER: userProfile data:", userProfile);
  console.log("🎨 RENDER: userProfile keys:", Object.keys(userProfile));
  console.log("🎨 RENDER: userPhotos:", userPhotos);
  console.log("🎨 RENDER: userPhotos length:", userPhotos.length);

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate("/match")}
          className="profile-back-btn"
        >
          Back
        </Button>
        <Typography.Title level={4} className="profile-title">
          My Profile
        </Typography.Title>
        <Button
          style={{ marginLeft: 8 }}
          type="primary"
          icon={<EditOutlined />}
          onClick={openChangePasswordModal}
          className="profile-edit-btn"
        >
          Change Password
        </Button>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <Row gutter={24}>
          {/* Left Column - Avatar & Basic Info */}
          <Col xs={24} md={10}>
            <Card className="profile-main-card">
              <div className="profile-avatar-section">
                <Avatar
                  size={120}
                  src={getAvatarUrl()}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <Typography.Title level={3} className="profile-name">
                  {(() => {
                    const name =
                      userProfile.fullName ||
                      userProfile.full_name ||
                      userProfile.username ||
                      "Tên người dùng";
                    console.log("👤 Rendering name:", name);
                    return name;
                  })()}
                </Typography.Title>
                <Typography.Text className="profile-username">
                  @
                  {(() => {
                    const username = userProfile.username || "username";
                    console.log("📛 Rendering username:", username);
                    return username;
                  })()}
                </Typography.Text>
                {(userProfile.birthday ||
                  userProfile.birthDay ||
                  userProfile.birth_day) && (
                  <div className="profile-age">
                    {(() => {
                      const age = calculateAge(
                        userProfile.birthday ||
                          userProfile.birthDay ||
                          userProfile.birth_day
                      );
                      console.log("🎂 Rendering age:", age);
                      return age;
                    })()}{" "}
                    years old
                  </div>
                )}
              </div>

              <Divider />

              {/* Quick Info */}
              <div className="quick-info">
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="info-box">
                      <div className="info-number">
                        {userProfile.tall || userProfile.height || "?"}
                      </div>
                      <div className="info-label">Height (cm)</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-box">
                      <div className="info-number">
                        {formatGender(userProfile.gender) || "?"}
                      </div>
                      <div className="info-label">Gender</div>
                    </div>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* Photo Gallery */}
              <div className="photo-gallery">
                <div className="gallery-header">
                  <Typography.Text strong>My Images</Typography.Text>
                  <Typography.Text className="gallery-count">
                    ({userPhotos.length}/6)
                  </Typography.Text>
                </div>

                <div className="photo-grid">
                  {userPhotos
                    .filter((photo) => photo && photo.imageUrl)
                    .map((photo, index) => (
                      <div key={photo.id || index} className="photo-item">
                        <div className="photo-wrapper">
                          <Image
                            src={photo.imageUrl}
                            alt={`Photo ${index + 1}`}
                            className="photo-thumbnail"
                            preview={true}
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="delete-photo-btn"
                          />
                          {photo.isNew && (
                            <div className="new-photo-badge">New</div>
                          )}
                        </div>
                        {index === 0 && (
                          <div className="main-photo-badge">Main Photo</div>
                        )}
                      </div>
                    ))}

                  {userPhotos.length < 6 && (
                    <Upload
                      beforeUpload={handlePhotoUpload}
                      showUploadList={false}
                      accept="image/*"
                      className="photo-upload"
                    >
                      <div className="upload-placeholder">
                        <PlusOutlined />
                        <div>Add image</div>
                      </div>
                    </Upload>
                  )}
                </div>

                {/* Save Images Button */}
                {hasImageChanges && (
                  <div className="save-images-section">
                    <Button
                      type="primary"
                      icon={<CameraOutlined />}
                      onClick={handleSaveImageChanges}
                      loading={uploadingPhoto}
                      className="save-images-btn"
                    >
                      {uploadingPhoto
                        ? "Saving Images..."
                        : "Save Image Changes"}
                    </Button>
                    <Typography.Text type="secondary" className="save-hint">
                      You have unsaved image changes
                    </Typography.Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Right Column - Detailed Info */}
          <Col xs={24} md={14}>
            <Card className="profile-details-card" title="Detailed Information">
              <div className="details-grid">
                <div className="detail-item">
                  <MailOutlined className="detail-icon" />
                  <div>
                    <div className="detail-label">Email</div>
                    <div className="detail-value">
                      {userProfile.email || "Not updated"}
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <CalendarOutlined className="detail-icon" />
                  <div>
                    <div className="detail-label">Birthday</div>
                    <div className="detail-value">
                      {userProfile.birthday ||
                      userProfile.birthDay ||
                      userProfile.birth_day
                        ? moment(
                            userProfile.birthday ||
                              userProfile.birthDay ||
                              userProfile.birth_day
                          ).format("DD/MM/YYYY")
                        : "Not updated"}
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <HomeOutlined className="detail-icon" />
                  <div>
                    <div className="detail-label">School</div>
                    <div className="detail-value">
                      {userProfile.school || "Not updated"}
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <BankOutlined className="detail-icon" />
                  <div>
                    <div className="detail-label">Company</div>
                    <div className="detail-value">
                      {userProfile.company || "Not updated"}
                    </div>
                  </div>
                </div>

                <div className="detail-item bio-item">
                  <HeartOutlined className="detail-icon" />
                  <div>
                    <div className="detail-label">About Me</div>
                    <div className="detail-value bio-text">
                      {userProfile.bio ||
                        userProfile.description ||
                        "No bio information available..."}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditModalVisible(true)}
                  className="profile-edit-btn"
                >
                  Edit
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        className="edit-profile-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          className="edit-profile-form"
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[
              { required: true, message: "Please enter your full name!" },
            ]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select your gender!" }]}
          >
            <Select placeholder="Select gender">
              <Option value={1}>Male</Option>
              <Option value={0}>Female</Option>
              <Option value={2}>Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Birthday" name="birthDay">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select your birthday"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item label="Height (cm)" name="tall">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter your height"
              min={140}
              max={220}
            />
          </Form.Item>

          <Form.Item label="School" name="school">
            <Input placeholder="Enter your school name" />
          </Form.Item>

          <Form.Item label="Company" name="company">
            <Input placeholder="Enter your company name" />
          </Form.Item>

          <Form.Item label="About Me" name="bio">
            <TextArea
              rows={4}
              placeholder="Write a few lines about yourself..."
              maxLength={500}
            />
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={changePasswordModalVisible}
        onCancel={() => setChangePasswordModalVisible(false)}
        footer={null}
        width={520}
        className="change-password-modal"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="change-password-form"
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter current password" },
            ]}
          >
            <Input.Password placeholder="Current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Please enter new password" }]}
          >
            <Input.Password placeholder="New password (min 6 chars)" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => setChangePasswordModalVisible(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => passwordForm.submit()}
              loading={changingPassword}
            >
              Change Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
