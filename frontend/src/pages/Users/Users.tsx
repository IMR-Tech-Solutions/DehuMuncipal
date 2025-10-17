import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonLoading from "../../components/common/ButtonLoading";
import Label from "../../components/form/Label";
import FileInput from "../../components/form/input/FileInput";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import { getallrolesservice } from "../../services/rolesservices";
import { RoleData } from "../../types/types";
import { addnewuserservice } from "../../services/newuserservices";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import ButtonComponentCard from "../../components/common/ButtonComponentCard";
import { all_routes } from "../../Router/allroutes";

const Users = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userdata, setUserdata] = useState({
    email: "",
    password: "",
    mobile_number: "",
    first_name: "",
    last_name: "",
    user_type: "",
    country: "",
    state: "",
    city: "",
    postal_code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userImage, setUserImage] = useState<File | null>(null);
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
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUserImage(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requiredFields = [
      "email",
      "password",
      "mobile_number",
      "first_name",
      "last_name",
      "user_type",
    ];
    for (const field of requiredFields) {
      if (!userdata[field as keyof typeof userdata]) {
        toast.error(`${field.replace("_", " ")} is required.`);
        return;
      }
    }
    setIsLoading(true);
    const data = new FormData();
    for (const key in userdata) {
      data.append(key, (userdata as any)[key]);
    }
    if (userImage) {
      data.append("user_image", userImage);
    }
    try {
      await addnewuserservice(data);
      toast.success("User added successfully!");
      setUserdata({
        email: "",
        password: "",
        mobile_number: "",
        first_name: "",
        last_name: "",
        user_type: "",
        country: "",
        state: "",
        city: "",
        postal_code: "",
      });
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Add User"
        description="Add a new user to Inventa System"
      />
      <PageBreadcrumb pageTitle="Add New User" />
      <ButtonComponentCard
        title="User Description"
        buttontitle="View All Users"
        buttonlink={all_routes.viewusers}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            {/* Required Fields */}
            <div>
              <Label>Email</Label>
              <input
                type="email"
                name="email"
                value={userdata.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div className="relative">
              <Label>Password</Label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={userdata.password}
                onChange={handleChange}
                placeholder="Enter password"
               className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>

            <div>
              <Label>Mobile Number</Label>
              <input
                type="text"
                name="mobile_number"
                value={userdata.mobile_number}
                placeholder="Enter Mobile No."
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div>
              <Label>First Name</Label>
              <input
                type="text"
                name="first_name"
                placeholder="Enter First Name"
                value={userdata.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <input
                type="text"
                name="last_name"
                placeholder="Enter Last Name"
                value={userdata.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div>
              <Label>User Type</Label>
              <select
                name="user_type"
                value={userdata.user_type}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              >
                <option value="" className="text-black">
                  Select Role
                </option>
                {roles
                  .filter((x) => x.role_name !== "admin")
                  .map((role: RoleData) => (
                    <option
                      key={role.role_id}
                      value={role.role_id}
                      className="text-black"
                    >
                      {role.role_name}
                    </option>
                  ))}
              </select>
            </div>
            {/* Optional Fields */}
            <div>
              <Label>Country</Label>
              <input
                type="text"
                name="country"
                placeholder="Enter Country"
                value={userdata.country}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div>
              <Label>State</Label>
              <input
                type="text"
                name="state"
                placeholder="Enter State"
                value={userdata.state}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div>
              <Label>City</Label>
              <input
                type="text"
                name="city"
                placeholder="Enter City"
                value={userdata.city}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <input
                type="text"
                name="postal_code"
                placeholder="Enter Postal Code"
                value={userdata.postal_code}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-800 dark:text-white/90 px-4 py-2.5"
              />
            </div>
            {/* Profile Image */}
            <div>
              <Label>Profile Image</Label>
              <FileInput
                onChange={handleFileChange}
                // @ts-ignore
                accept=".png,.jpg,.jpeg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepts only .jpeg, .jpg, .png
              </p>
            </div>
          </div>
          <ButtonLoading
            loading={isLoading}
            state="Add User"
            loadingstate="Adding User..."
            className="w-fit mt-8"
          />
        </form>
      </ButtonComponentCard>
    </>
  );
};

export default Users;
