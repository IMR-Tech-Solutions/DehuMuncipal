import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Table, Input, Button, Space, Popconfirm } from "antd";
import ComponentCard from "../../components/common/ComponentCard";
import {
  deleteroleservice,
  getallrolesservice,
} from "../../services/rolesservices";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { RoleData } from "../../types/types";
import { handleError } from "../../utils/handleError";

const { Search } = Input;

const AllrolesTable = forwardRef((_, ref) => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [filteredRoles, setfilteredRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getallrolesservice();
      setRoles(data);
      setfilteredRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refetchRoles: fetchRoles,
  }));

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSearch = (value: string) => {
    const filtered = roles.filter((role) =>
      role.role_name?.toLowerCase().includes(value.toLowerCase())
    );
    setfilteredRoles(filtered);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "Sr. No",
      key: "srno",
      render: (_: any, __: RoleData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Role Name",
      dataIndex: "role_name",
      key: "role_name",
      sorter: (a: RoleData, b: RoleData) =>
        (a.role_name || "").localeCompare(b.role_name || ""),
      render: (name: string) => (
        <span className="text-gray-800 dark:text-white/90">
          {name ? name.charAt(0).toUpperCase() + name.slice(1) : "N/A"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: RoleData) => (
        <Space size="small">
          <Popconfirm
            title={
              <>
                <div className="font-semibold text-red-600">
                  Confirm Delete?
                </div>
                <div className="text-sm mt-1 dark:text-white text-gray-700">
                  This will permanently delete the role.
                  <br />
                  <span className="text-red-500 font-medium">
                    All users associated with this role will also be removed!
                  </span>
                </div>
              </>
            }
            onConfirm={() => handledelete(record.role_id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              id="table-delete-btn"
              size="small"
              icon={<DeleteOutlined />}
              loading={loading}
              danger
            />
          </Popconfirm>
          <Button
            id="table-update-btn"
            size="small"
            icon={<EditOutlined />}
            loading={loading}
            onClick={() => handleEdit(record.role_id)}
          />
        </Space>
      ),
    },
  ];

  const handledelete = async (roleID: number) => {
    try {
      await deleteroleservice(roleID);
      toast.success("Role deleted successfully.");
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      handleError(error);
    }
  };

  const handleEdit = async (roleID: number) => {
    navigate(`/role-permissions/${roleID}`);
  };

  return (
    <div>
      <ComponentCard title="View All Roles">
        <div className="mb-4">
          <Search
            placeholder="Search roles..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="custom-search"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredRoles}
          loading={loading}
          rowKey="role_id"
          className="custom-orders-table"
          pagination={{
            pageSize: 10,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current || 1);
          }}
          scroll={{ x: 800 }}
          locale={{ emptyText: "No Roles available." }}
        />
      </ComponentCard>
    </div>
  );
});

export default AllrolesTable;
