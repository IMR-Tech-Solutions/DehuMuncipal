import {
  Modal,
  Form,
  Input,
  Upload,
  UploadProps,
  Select,
  Row,
  Col,
} from "antd";
import { UserData, RoleData } from "../../types/types";
import { useEffect, useState } from "react";
import { updateuserservice } from "../../services/newuserservices";
import { getallrolesservice } from "../../services/rolesservices";
import { toast } from "react-toastify";
import { UploadOutlined } from "@ant-design/icons";
import { handleError } from "../../utils/handleError";
import { getChangedFormData } from "../../utils/changedData";

const { Option } = Select;

const Edituser = ({
  selectedUser,
  visible,
  onCancel,
  fetchAllusers,
}: {
  selectedUser: UserData;
  visible: boolean;
  onCancel: () => void;
  fetchAllusers: () => void;
}) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);

  const fetchRoles = async () => {
    try {
      const res = await getallrolesservice();
      setRoles(res);
    } catch (err) {
      handleError(err);
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    if (selectedUser && visible) {
      form.setFieldsValue({
        email: selectedUser.email,
        mobile_number: selectedUser.mobile_number,
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        user_type: selectedUser.user_type,
        country: selectedUser.country || "",
        state: selectedUser.state || "",
        city: selectedUser.city || "",
        postal_code: selectedUser.postal_code || "",
      });
    }
  }, [selectedUser, visible, form]);

  const handleOk = async () => {
    console.log("✅ EditUser Save clicked");
    const values = await form.validateFields();
    const userID = selectedUser.id;
    try {
      const formData = getChangedFormData(
        selectedUser,
        values,
        file,
        "user_image"
      );
      await updateuserservice(userID, formData);
      toast.success("User updated successfully");
      fetchAllusers();
      onCancel();
    } catch (err: any) {
      console.error("Error updating user:", err);
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
      title="Edit User"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" name="edit_user">
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label="Email" name="email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mobile Number"
              name="mobile_number"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {selectedUser.user_type_name == "admin" ? (
          <></>
        ) : (
          <Form.Item
            label="User Type"
            name="user_type"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select user type">
              {roles
                .filter((x) => x.role_name !== "admin")
                .map((role: RoleData) => (
                  <Option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}

        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label="Country" name="country">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="State" name="state">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label="City" name="city">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Postal Code" name="postal_code">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Profile Image" name="user_image">
          <Upload {...uploadProps} maxCount={1} accept="image/*">
            <button type="button" id="form-btn">
              <UploadOutlined /> <span>Click to upload</span>
            </button>
          </Upload>
        </Form.Item>
        {selectedUser?.user_image && (
          <Form.Item label="Current Image">
            <img
              src={`${import.meta.env.VITE_API_IMG_URL}${
                selectedUser.user_image
              }`}
              alt="Profile"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                objectFit: "cover",
              }}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default Edituser;
