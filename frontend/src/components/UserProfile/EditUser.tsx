import { Modal, Form, Input, Upload, UploadProps, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import { getChangedFormData } from "../../utils/changedData";
import { updateUserDetails } from "../../services/userdetailsservice";
import { UserData } from "../../types/types";

const EditUser = ({
  userData,
  visible,
  onCancel,
  fetchUserData,
}: {
  userData: UserData;
  visible: boolean;
  onCancel: () => void;
  fetchUserData: () => void;
}) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (userData && visible) {
      form.setFieldsValue({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        mobile_number: userData.mobile_number,
        country: userData.country,
        city: userData.city,
        state: userData.state,
        postal_code: userData.postal_code,
      });
    }
  }, [userData, visible, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      const formData = getChangedFormData(userData, values, file, "user_image");
      await updateUserDetails(formData);
      toast.success("Profile updated successfully");
      fetchUserData();
      onCancel();
    } catch (err) {
      console.error("Error updating profile:", err);
      handleError(err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFile(null);
    onCancel();
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    fileList: file ? [file as any] : [],
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Save"
      cancelText="Cancel"
      width={800}
    >
      <Form form={form} layout="vertical" name="edit_user">
        {/* Personal Information Section */}
        <div className="mb-4">
          <h4 className="mb-3 text-md font-semibold text-gray-800 dark:text-white/90">
            Personal Information
          </h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[
                  {
                    min: 2,
                    message: "First name must be at least 2 characters!",
                  },
                ]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[
                  {
                    min: 2,
                    message: "Last name must be at least 2 characters!",
                  },
                ]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" name="mobile_number">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Address Information Section */}
        <div className="mb-4">
          <h4 className="mb-3 text-md font-semibold text-gray-800 dark:text-white/90">
            Address Information
          </h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Country" name="country">
                <Input placeholder="Enter country" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="State" name="state">
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="City" name="city">
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Postal Code" name="postal_code">
                <Input placeholder="Enter postal code" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Profile Image Section */}
        <Form.Item label="Profile Image" name="user_image">
          <Upload {...uploadProps} maxCount={1} accept="image/*">
            <button type="button" id="form-btn">
              <UploadOutlined /> <span>Click to upload</span>
            </button>
          </Upload>
        </Form.Item>

        {userData?.user_image && (
          <Form.Item label="Current Profile Picture">
            <img
              src={`${import.meta.env.VITE_API_IMG_URL}${userData.user_image}`}
              alt="Profile"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EditUser;
