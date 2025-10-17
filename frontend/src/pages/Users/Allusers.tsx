import { useEffect, useState } from "react";
import { Table, Input, Button, Space, Popconfirm } from "antd";
import {
  getallusersservice,
  deleteuserservice,
  getsingleuserservice,
} from "../../services/newuserservices";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import Edituser from "./Edituser";
import { UserData } from "../../types/types";
import { handleError } from "../../utils/handleError";
import ButtonComponentCard from "../../components/common/ButtonComponentCard";
import { all_routes } from "../../Router/allroutes";

const { Search } = Input;

const Allusers = () => {
  const [allusers, setAllusers] = useState<UserData[]>([]);
  const [filteredAllusers, setfilteredAllusers] = useState<UserData[]>([]);
  const [updateuserData, setUpdateuserData] = useState<UserData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchAllusers = async () => {
    setLoading(true);
    try {
      const data = await getallusersservice();
      setAllusers(data);
      setfilteredAllusers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllusers();
  }, []);

  const handleSearch = (value: string) => {
    const filtered = allusers.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(value.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(value.toLowerCase()) ||
        user.mobile_number?.includes(value) ||
        user.country?.toLowerCase().includes(value.toLowerCase()) ||
        user.email?.toLowerCase().includes(value.toLowerCase()) ||
        user.user_type_name?.toLowerCase().includes(value.toLowerCase()) ||
        user.state?.toLowerCase().includes(value.toLowerCase()) ||
        user.postal_code?.includes(value)
    );
    setfilteredAllusers(filtered);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "Sr. No",
      key: "srno",
      render: (_: any, __: UserData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "User Role",
      dataIndex: "user_type_name",
      key: "user_type_name",
      sorter: (a: UserData, b: UserData) =>
        (a.user_type_name || "").localeCompare(b.user_type_name || ""),
      render: (name: string) => (
        <span className="truncate role-field font-medium text-xs text-white/90">
          {name ? name.charAt(0).toUpperCase() + name.slice(1) : "N/A"}
        </span>
      ),
    },
    {
      title: "Name",
      dataIndex: "first_name",
      key: "name",
      sorter: (a: UserData, b: UserData) =>
        `${a.first_name || ""} ${a.last_name || ""}`.localeCompare(
          `${b.first_name || ""} ${b.last_name || ""}`
        ),
      render: (_: any, record: UserData) => (
        <span className="truncate text-gray-800 dark:text-white/90">
          {record.first_name || record.last_name
            ? `${record.first_name || ""} ${record.last_name || ""}`
            : "N/A"}
        </span>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "mobile_number",
      key: "mobile_number",
      sorter: (a: UserData, b: UserData) =>
        (a.mobile_number || "").localeCompare(b.mobile_number || ""),
      render: (name: string) => (
        <span className="truncate text-gray-800 dark:text-white/90">
          {name || "N/A"}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: UserData, b: UserData) =>
        (a.email || "").localeCompare(b.email || ""),
      render: (name: string) => (
        <span className="truncate text-gray-800 dark:text-white/90">
          {name || "N/A"}
        </span>
      ),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a: UserData, b: UserData) =>
        (a.city || "").localeCompare(b.city || ""),
      render: (name: string) => (
        <span className="truncate text-gray-800 dark:text-white/90">
          {name || "N/A"}
        </span>
      ),
    },
    {
      title: "Profile Image",
      dataIndex: "user_image",
      key: "user_image",
      render: (url: string) => (
        <img
          src={`${import.meta.env.VITE_API_IMG_URL}${url}`}
          alt="Category"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            borderRadius: "100%",
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserData) => (
        <Space size="small">
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handledelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              id="table-delete-btn"
              size="small"
              icon={<DeleteOutlined />}
              loading={loading}
            />
          </Popconfirm>
          <Button
            id="table-update-btn"
            size="small"
            icon={<EditOutlined />}
            loading={loading}
            onClick={() => handleEdit(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handledelete = async (userID: number) => {
    try {
      await deleteuserservice(userID);
      toast.success("User deleted successfully.");
      fetchAllusers();
    } catch (error) {
      console.error("Error deleting user:", error);
      handleError(error);
    }
  };

  const handleEdit = async (userID: number) => {
    try {
      const selectedUser = await getsingleuserservice(userID);
      setUpdateuserData(selectedUser);
      setModalVisible(true);
    } catch (error) {
      console.error("Unable Update user:", error);
      handleError(error);
    }
  };

  return (
    <div>
      {/* <PageMeta
        title="All Users"
        description="View, manage, and organize all user accounts within the Inventa system."
      />
      <PageBreadcrumb pageTitle="All Users" /> */}
      <ButtonComponentCard
        title="View All Users"
        buttonlink={all_routes.users}
        buttontitle="Add New User"
        className="mt-10"
      >
        <div className="mb-4">
          <Search
            placeholder="Search users..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="custom-search"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredAllusers}
          loading={loading}
          rowKey="id"
          className="custom-orders-table"
          pagination={{
            pageSize: 10,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current || 1);
          }}
          scroll={{ x: 800 }}
          locale={{ emptyText: "No users found." }}
        />
      </ButtonComponentCard>
      {updateuserData && (
        <Edituser
          fetchAllusers={fetchAllusers}
          selectedUser={updateuserData}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default Allusers;
