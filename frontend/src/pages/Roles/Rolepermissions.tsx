import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import {
  getrolepermissionsservice,
  updaterolepermissionsservice,
} from "../../services/rolesservices";
import { getavailableservices } from "../../services/allavailableservices";
import { handleError } from "../../utils/handleError";
import ComponentCard from "../../components/common/ComponentCard";
import { Spin, Tag, Empty, Button, Checkbox } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

interface AvailablePermission {
  name: string;
  method: string;
}

const Rolepermissions = () => {
  const { roleID } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [rolename, setRoleName] = useState<string>("");
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablepermissions, setAvailablepermissions] = useState<
    AvailablePermission[]
  >([]);

  const getRolePermissions = async () => {
    setIsLoading(true);
    try {
      const response = await getrolepermissionsservice(Number(roleID));
      setRoleName(response.role);
      setOriginalPermissions(response.permissions);
      setSelectedPermissions(response.permissions);
    } catch (error) {
      console.error(error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailablePermission = async () => {
    setIsLoading(true);
    try {
      const response = await getavailableservices();
      setAvailablepermissions(response);
    } catch (error) {
      handleError(error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePermission = (permToRemove: string) => {
    setSelectedPermissions((prev) => prev.filter((p) => p !== permToRemove));
  };

  const handleCheckboxChange = (checkedValues: string[]) => {
    setSelectedPermissions(checkedValues as string[]);
  };

  const handleCancel = () => {
    setSelectedPermissions(originalPermissions);
    navigate(-1);
  };

  const handleSave = async () => {
    try {
      if (!roleID) return;
      const payload = {
        module_permissions: selectedPermissions,
      };
      await updaterolepermissionsservice(Number(roleID), payload);
      toast.success("Permissions updated successfully");
      setOriginalPermissions(selectedPermissions);
      navigate(-1);
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  useEffect(() => {
    if (roleID) {
      getRolePermissions();
      getAvailablePermission();
    }
  }, [roleID]);

  return (
    <div className="p-2 sm:p-4">
      <PageMeta
        title="Role Permissions"
        description={`Manage and assign permissions for ${rolename}`}
      />
      <PageBreadcrumb pageTitle="Role Permissions" />
      <ComponentCard
        title={rolename ? `Permissions for "${rolename}" Role` : "Permissions"}
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : selectedPermissions.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedPermissions.map((permission) => (
              <Tag
                key={permission}
                icon={<CheckOutlined />}
                color="processing"
                closable
                onClose={() => handleRemovePermission(permission)}
                className="px-3 py-1 text-sm font-medium capitalize"
              >
                {permission.replace(/-/g, " ")}
              </Tag>
            ))}
          </div>
        ) : (
          <Empty
            description="No permissions assigned to this role."
            className="my-8"
          />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </ComponentCard>

      <div className="my-11" />

      <ComponentCard title="Add More Permissions">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : availablepermissions.length > 0 ? (
          <Checkbox.Group
            value={selectedPermissions}
            onChange={handleCheckboxChange}
            className="grid grid-cols-3 gap-4"
          >
            {availablepermissions.map((item) => (
              <div
                key={item.method}
                className="border border-gray-300 dark:border-white p-3 rounded w-fit break-all"
              >
                <Checkbox value={item.method}>{item.name}</Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        ) : (
          <Empty description="No available permissions." className="my-8" />
        )}
      </ComponentCard>
    </div>
  );
};

export default Rolepermissions;
