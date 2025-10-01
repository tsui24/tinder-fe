import React, { useState } from "react";
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./RegisterInfo.css";

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

  // Database of available interests
  const availableInterests = [
    { id: 1, name: "Travel" },
    { id: 2, name: "Photography" },
    { id: 3, name: "Music" },
    { id: 4, name: "Movies" },
    { id: 5, name: "Reading" },
    { id: 6, name: "Cooking" },
    { id: 7, name: "Gaming" },
    { id: 8, name: "Sports" },
    { id: 9, name: "Fitness" },
    { id: 10, name: "Yoga" },
    { id: 11, name: "Dancing" },
    { id: 12, name: "Art" },
    { id: 13, name: "Fashion" },
    { id: 14, name: "Technology" },
    { id: 15, name: "Nature" },
    { id: 16, name: "Animals" },
    { id: 17, name: "Coffee" },
    { id: 18, name: "Wine" },
    { id: 19, name: "Beer" },
    { id: 20, name: "Foodie" },
    { id: 21, name: "Adventure" },
    { id: 22, name: "Beach" },
    { id: 23, name: "Mountains" },
    { id: 24, name: "Camping" },
    { id: 25, name: "Hiking" },
    { id: 26, name: "Running" },
    { id: 27, name: "Swimming" },
    { id: 28, name: "Basketball" },
    { id: 29, name: "Football" },
    { id: 30, name: "Soccer" },
    { id: 31, name: "Tennis" },
    { id: 32, name: "Baseball" },
    { id: 33, name: "Volleyball" },
    { id: 34, name: "Rock Climbing" },
    { id: 35, name: "Surfing" },
    { id: 36, name: "Skiing" },
    { id: 37, name: "Snowboarding" },
    { id: 38, name: "Cycling" },
    { id: 39, name: "Motorcycles" },
    { id: 40, name: "Cars" },
    { id: 41, name: "Science" },
    { id: 42, name: "History" },
    { id: 43, name: "Politics" },
    { id: 44, name: "Business" },
    { id: 45, name: "Entrepreneurship" },
    { id: 46, name: "Investment" },
    { id: 47, name: "Cryptocurrency" },
    { id: 48, name: "Meditation" },
    { id: 49, name: "Spirituality" },
    { id: 50, name: "Volunteering" },
    { id: 51, name: "Charity" },
    { id: 52, name: "Environment" },
    { id: 53, name: "Sustainability" },
  ];

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
    // Update form field value with IDs for submission
    const interestIds = tempSelectedInterests.map((interest) => interest.id);
    form.setFieldsValue({ interests: interestIds });
    message.success(`${tempSelectedInterests.length} interests saved!`);
  };

  const handleCancelInterests = () => {
    setTempSelectedInterests([...selectedInterests]);
    setInterestsModalVisible(false);
  };

  const onFinish = (values) => {
    // Format birthday to dd/MM/yyyy for backend
    const formattedValues = {
      ...values,
      birthday: values.birthday
        ? dayjs(values.birthday).format("DD/MM/YYYY")
        : null,
    };

    console.log("Profile info submitted:", formattedValues);
    console.log("Selected interest IDs:", formattedValues.interests);
    console.log("Formatted birthday:", formattedValues.birthday);

    // Handle profile completion logic here
    message.success("Profile created successfully!");
    // Navigate to main app or dashboard
    // navigate("/");
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Profile creation failed:", errorInfo);
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setImageList(newFileList);
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return false;
    }

    // Check if we already have 6 images (maximum limit)
    if (imageList.length >= 6) {
      message.error("You can upload maximum 6 photos!");
      return false;
    }

    // Process the file immediately without uploading to server
    getBase64(file, (url) => {
      file.url = url;
      file.status = "done";
      setUploading(false);
    });

    // Return false to prevent automatic upload
    return false;
  };

  const uploadButton = (
    <div>
      {uploading ? <CameraOutlined /> : <PlusOutlined />}
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
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Form.Item
                  label="Interested In"
                  name="interestedIn"
                  rules={[
                    {
                      required: true,
                      message: "Please select who you are interested in!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Interested in"
                    size="large"
                    className="register-info-select"
                  >
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="both">Both</Option>
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
                      // Disable future dates and dates older than 100 years
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
                  {selectedInterests.length > 0 ? (
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
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
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
                >
                  Complete Profile
                </Button>
                <Button
                  type="text"
                  size="large"
                  onClick={() => navigate(-1)}
                  className="back-button"
                  block
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
            {availableInterests.map((interest) => (
              <div
                key={interest.id}
                className={`interest-item ${
                  tempSelectedInterests.some((item) => item.id === interest.id)
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
    </div>
  );
}

export default RegisterInfo;
