import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import ButtonLoading from "../../components/common/ButtonLoading";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import { addnewroleservice } from "../../services/rolesservices";
import AllrolesTable from "./AllrolesTable";

const Roles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleName, SetRoleName] = useState("");
  const tableRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const roleData = new FormData();
      roleData.append("role_name", roleName);
      await addnewroleservice(roleData);
      toast.success(`Role ${roleName} created successfully`);
      SetRoleName("");
      tableRef.current?.refetchRoles();
    } catch (error) {
      handleError(error);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <PageMeta
        title="Manage Roles"
        description="Create, assign, and manage user roles and permissions for iventa"
      />
      <PageBreadcrumb pageTitle="Manage Roles" />
      <ComponentCard title="Add New Roles">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 mb-6">
            <div>
              <Label>Role Name</Label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => SetRoleName(e.target.value)}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
                placeholder="Enter role name"
              />
            </div>
          </div>
          <ButtonLoading
            loading={isLoading}
            state={"Add Role"}
            loadingstate={"Adding Role.."}
            className="w-fit"
          />
        </form>
      </ComponentCard>
      <div className="my-11"></div>
      <AllrolesTable ref={tableRef} />
    </div>
  );
};

export default Roles;
