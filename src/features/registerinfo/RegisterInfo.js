import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Select,
  DatePicker,
  Upload,
  Space,
  Row,
  Col,
  message,
  Modal,
  Checkbox,
  Tag,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  CameraOutlined,
  PlusOutlined,
  HeartOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { supabase } from "../../config/supabaseClient";
import {
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
} from "../../utils/notification";
import "./RegisterInfo.css";
import authService from "../../api/authService";
import interestService from "../../api/interestService/interestService";

const { Title, Text } = Typography;
const { Option } = Select;

function RegisterInfo() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [imageList, setImageList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [interestsModalVisible, setInterestsModalVisible] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [tempSelectedInterests, setTempSelectedInterests] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [availableInterests, setAvailableInterests] = useState([]);

  useEffect(() => {
    // Fetch interests from backend API
    const fetchInterests = async () => {
      try {
        const response = await interestService.getInterests();
        if (response && response.data) {
          setAvailableInterests(response.data.result);
        }
      } catch (error) {
        console.error("Error fetching interests:", error);
        setAvailableInterests([]);
      }
    };
    fetchInterests();
  }, []);
  // Database of available interests
  // const availableInterests = [
  //   { id: 1, name: "Travel" },
  //   { id: 2, name: "Photography" },
  //   { id: 3, name: "Music" },
  //   { id: 4, name: "Movies" },
  //   { id: 5, name: "Reading" },
  //   { id: 6, name: "Cooking" },
  //   { id: 7, name: "Gaming" },
  //   { id: 8, name: "Sports" },
  //   { id: 9, name: "Fitness" },
  //   { id: 10, name: "Yoga" },
  //   { id: 11, name: "Dancing" },
  //   { id: 12, name: "Art" },
  //   { id: 13, name: "Fashion" },
  //   { id: 14, name: "Technology" },
  //   { id: 15, name: "Nature" },
  //   { id: 16, name: "Animals" },
  //   { id: 17, name: "Coffee" },
  //   { id: 18, name: "Wine" },
  //   { id: 19, name: "Beer" },
  //   { id: 20, name: "Foodie" },
  //   { id: 21, name: "Adventure" },
  //   { id: 22, name: "Beach" },
  //   { id: 23, name: "Mountains" },
  //   { id: 24, name: "Camping" },
  //   { id: 25, name: "Hiking" },
  //   { id: 26, name: "Running" },
  //   { id: 27, name: "Swimming" },
  //   { id: 28, name: "Basketball" },
  //   { id: 29, name: "Football" },
  //   { id: 30, name: "Soccer" },
  //   { id: 31, name: "Tennis" },
  //   { id: 32, name: "Baseball" },
  //   { id: 33, name: "Volleyball" },
  //   { id: 34, name: "Rock Climbing" },
  //   { id: 35, name: "Surfing" },
  //   { id: 36, name: "Skiing" },
  //   { id: 37, name: "Snowboarding" },
  //   { id: 38, name: "Cycling" },
  //   { id: 39, name: "Motorcycles" },
  //   { id: 40, name: "Cars" },
  //   { id: 41, name: "Science" },
  //   { id: 42, name: "History" },
  //   { id: 43, name: "Politics" },
  //   { id: 44, name: "Business" },
  //   { id: 45, name: "Entrepreneurship" },
  //   { id: 46, name: "Investment" },
  //   { id: 47, name: "Cryptocurrency" },
  //   { id: 48, name: "Meditation" },
  //   { id: 49, name: "Spirituality" },
  //   { id: 50, name: "Volunteering" },
  //   { id: 51, name: "Charity" },
  //   { id: 52, name: "Environment" },
  //   { id: 53, name: "Sustainability" },
  // ];

  const handleInterestsClick = () => {
    setTempSelectedInterests([...selectedInterests]);
    setInterestsModalVisible(true);
  };

  const handleInterestChange = (interest) => {
    const isSelected = tempSelectedInterests.some(
      (item) => item.id === interest.id
    );
    const newInterests = isSelected
      ? tempSelectedInterests.filter((item) => item.id !== interest.id)
      : [...tempSelectedInterests, interest];

    if (newInterests.length <= 5) {
      setTempSelectedInterests(newInterests);
    } else {
      message.warning("You can select maximum 5 interests!");
    }
  };

  const handleSaveInterests = () => {
    setSelectedInterests([...tempSelectedInterests]);
    setInterestsModalVisible(false);
    const interestIds = tempSelectedInterests.map((interest) => interest.id);
    form.setFieldsValue({ interests: interestIds });
    message.success(`${tempSelectedInterests.length} interests saved!`);
  };

  const handleCancelInterests = () => {
    setTempSelectedInterests([...selectedInterests]);
    setInterestsModalVisible(false);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Preview ảnh
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

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

  const handleImageChange = async ({ fileList: newFileList }) => {
    // Chỉ cập nhật preview, chưa upload
    const updatedList = await Promise.all(
      newFileList.map(async (file) => {
        if (!file.url && !file.preview && file.originFileObj) {
          file.preview = await getBase64(file.originFileObj);
        }
        return file;
      })
    );
    setImageList(updatedList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return Upload.LIST_IGNORE;
    }

    // No file size limit - users can upload images of any size

    if (imageList.length >= 6) {
      message.error("You can upload maximum 6 photos!");
      return Upload.LIST_IGNORE;
    }

    return false; // Không auto upload
  };

  // const onFinish = async (values) => {
  //   if (imageList.length === 0) {
  //     message.warning("Please upload at least 1 photo!");
  //     return;
  //   }
  //
  //   try {
  //     setUploading(true);
  //
  //     // Upload tất cả ảnh lên Supabase
  //     const uploadPromises = imageList.map((file) =>
  //         uploadToSupabase(file.originFileObj)
  //     );
  //
  //     const uploadResults = await Promise.all(uploadPromises);
  //     const imageUrls = uploadResults.map((result) => result.url);
  //
  //     // Format birthday to dd/MM/yyyy for backend
  //     const formattedValues = {
  //       ...values,
  //       birthday: values.birthday
  //           ? dayjs(values.birthday).format("DD/MM/YYYY")
  //           : null,
  //       images: imageUrls,
  //     };
  //
  //     console.log("Profile info submitted:", formattedValues);
  //     console.log("Selected interest IDs:", formattedValues.interests);
  //     console.log("Formatted birthday:", formattedValues.birthday);
  //     console.log("Image URLs:", imageUrls);
  //
  //     // Handle profile completion logic here
  //     // await axios.post("YOUR_API_ENDPOINT", formattedValues);
  //
  //     message.success("Profile created successfully!");
  //     // Navigate to main app or dashboard
  //     // navigate("/");
  //   } catch (error) {
  //     message.error(
  //         "Profile creation failed: " +
  //         (error.response?.data?.message || error.message)
  //     );
  //     console.error(error);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const onFinish = async (values) => {
    if (imageList.length === 0) {
      showWarningNotification(
        "Photo Required",
        "Please upload at least 1 photo!"
      );
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Upload tất cả ảnh lên Supabase
      const uploadPromises = imageList.map((file) =>
        uploadToSupabase(file.originFileObj)
      );
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map((result) => result.url);

      // 2️⃣ Hàm lấy vị trí (Promise wrapper)
      const getLocation = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => {
              console.warn("⚠️ Không lấy được vị trí:", err.message);
              // fallback về 0.0 nếu bị từ chối
              resolve({ latitude: 0.0, longitude: 0.0 });
            }
          );
        });
      };

      // 3️⃣ Chờ lấy vị trí xong rồi mới format dữ liệu
      const coords = await getLocation();

      const formattedValues = {
        fullName: values.fullName,
        email: values.email,
        addressLon: coords.longitude,
        addressLat: coords.latitude,
        gender: Number(values.gender),
        interestedIn: Number(values.interestedIn),
        birthday: values.birthday
          ? dayjs(values.birthday).format("DD/MM/YYYY")
          : null,
        images: imageUrls,
      };

      console.log("📍 Location:", coords.longitude, coords.latitude);
      console.log("📤 Sending user info to backend:", formattedValues);

      // 4️⃣ Gọi API POST /create-infor-user
      const response = await authService.create_user_info(formattedValues);

      showSuccessNotification(
        "Profile Created Successfully!",
        response.data.message || "Your profile has been created. Welcome!"
      );
      console.log("✅ Backend response:", response.data);

      // 5️⃣ Điều hướng sau khi thành công
      navigate("/match");
    } catch (error) {
      showErrorNotification(
        "Profile Creation Failed",
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Profile creation failed:", errorInfo);
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {imageList.length === 0
          ? "Upload Photos"
          : `Add More (${imageList.length}/6)`}
      </div>
    </div>
  );

  return (
    <div className="register-info-container">
      <div className="register-info-wrapper">
        <Card className="register-info-card" bordered={false}>
          <div className="register-info-header">
            <Title level={2} className="register-info-title">
              💕 Complete Your Profile
            </Title>
            <Text type="secondary" className="register-info-subtitle">
              Tell us about yourself to find better matches
            </Text>
          </div>

          <Form
            form={form}
            name="registerInfo"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="register-info-form"
          >
            <Row gutter={16}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: "Please input your full name!",
                    },
                    {
                      min: 2,
                      message: "Full name must be at least 2 characters long!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="input-icon" />}
                    placeholder="Enter your full name"
                    size="large"
                    className="register-info-input"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email address!",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="input-icon" />}
                    placeholder="Enter your email"
                    size="large"
                    className="register-info-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={24} md={8}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[
                    {
                      required: true,
                      message: "Please select your gender!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select gender"
                    size="large"
                    className="register-info-select"
                  >
                    <Option value="1">Male</Option>
                    <Option value="2">Female</Option>
                    <Option value="0">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Form.Item
                  label="Interested In"
                  name="interestedIn"
                  rules={[
                    {
                      required: false,
                      message: "Please select who you are interested in!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Interested in"
                    size="large"
                    className="register-info-select"
                  >
                    <Option value="1">Male</Option>
                    <Option value="2">Female</Option>
                    <Option value="0">Both</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  rules={[
                    {
                      required: true,
                      message: "Please select your birthday!",
                    },
                  ]}
                >
                  <DatePicker
                    placeholder="Select birthday"
                    size="large"
                    className="register-info-datepicker"
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    suffixIcon={<CalendarOutlined className="input-icon" />}
                    disabledDate={(current) => {
                      return (
                        current &&
                        (current > dayjs().endOf("day") ||
                          current < dayjs().subtract(100, "year"))
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Interests (Select up to 5)"
              name="interests"
              rules={[
                {
                  validator: (_, value) => {
                    if (selectedInterests.length === 0) {
                      return Promise.reject(
                        new Error("Please select at least one interest!")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <div className="interests-field" onClick={handleInterestsClick}>
                <div className="interests-display">
                  <HeartOutlined
                    className="input-icon"
                    style={{ marginRight: 8 }}
                  />
                  {Array.isArray(selectedInterests) &&
                  selectedInterests.length > 0 ? (
                    <div className="selected-interests">
                      {selectedInterests.map((interest) => (
                        <Tag
                          key={interest.id}
                          color="#ff4458"
                          className="interest-tag"
                        >
                          {interest.name}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">Click to select your interests</Text>
                  )}
                </div>
              </div>
            </Form.Item>

            <Form.Item
              label="Profile Pictures (1-6 photos)"
              name="images"
              rules={[
                {
                  validator: (_, value) => {
                    if (imageList.length === 0) {
                      return Promise.reject(
                        new Error("Please upload at least one photo!")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <div className="upload-section">
                <Upload
                  name="photos"
                  listType="picture-card"
                  className="avatar-uploader"
                  fileList={imageList}
                  beforeUpload={beforeUpload}
                  onChange={handleImageChange}
                  onPreview={handlePreview}
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  maxCount={6}
                >
                  {imageList.length >= 6 ? null : uploadButton}
                </Upload>
                <div className="upload-hint">
                  <Text type="secondary">
                    Upload 1-6 clear photos of yourself. JPG or PNG format, any
                    size.
                    <br />
                    First photo will be your main profile picture.
                  </Text>
                </div>
              </div>
            </Form.Item>

            <Form.Item className="form-actions">
              <Space
                size="large"
                direction="vertical"
                style={{ width: "100%" }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="complete-profile-button"
                  block
                  loading={uploading}
                  disabled={uploading}
                >
                  {uploading ? "Creating Profile..." : "Complete Profile"}
                </Button>
                <Button
                  type="text"
                  size="large"
                  onClick={() => navigate(-1)}
                  className="back-button"
                  block
                  disabled={uploading}
                >
                  Back
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Interests Selection Modal */}
      <Modal
        title="Select Your Interests"
        open={interestsModalVisible}
        onOk={handleSaveInterests}
        onCancel={handleCancelInterests}
        okText="Save Interests"
        cancelText="Cancel"
        width={600}
        className="interests-modal"
        okButtonProps={{
          disabled: tempSelectedInterests.length === 0,
          className: "interests-save-btn",
        }}
      >
        <div className="interests-modal-content">
          <Text type="secondary" className="interests-instruction">
            Choose up to 5 interests that describe you best (
            {tempSelectedInterests.length}/5 selected)
          </Text>

          <div className="interests-grid">
            {Array.isArray(availableInterests) &&
              availableInterests.map((interest) => (
                <div
                  key={interest.id}
                  className={`interest-item ${
                    tempSelectedInterests.some(
                      (item) => item.id === interest.id
                    )
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleInterestChange(interest)}
                >
                  <Checkbox
                    checked={tempSelectedInterests.some(
                      (item) => item.id === interest.id
                    )}
                    onChange={() => handleInterestChange(interest)}
                  >
                    {interest.name}
                  </Checkbox>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      {/* Preview Image Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}

export default RegisterInfo;
