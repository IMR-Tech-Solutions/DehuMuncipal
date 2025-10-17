import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { toast } from "react-toastify";
import api from "../../services/baseapi";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setUser,setPermissions } from "../../redux/userSlice";
import { setTokens } from "../../authentication/auth";
import ButtonLoading from "../common/ButtonLoading";
import { handleError } from "../../utils/handleError";
import { getusermoduleservice } from "../../services/gettingmoduleservice";

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [signinData, setSiginData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    for (const [key, value] of Object.entries(signinData)) {
      if (!value.trim()) {
        const formattedKey = key
          .replace("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
        setLoading(false);
        toast.error(`Please fill ${formattedKey}`);
        return;
      }
    }
    try {
      const response = await api.post("login/", signinData);
      const { access, refresh } = response.data;
      if (access && refresh) {
        setTokens({ access, refresh });
        const userData = await api.get("me/");
        dispatch(setUser(userData.data));
        const perms = await getusermoduleservice(userData.data.role_id);
        dispatch(setPermissions(perms));
        navigate("/");
        toast.success("Signin successful !");
      }
    } catch (error: any) {
      console.error("Error Occurred:", error);
      console.log(error.response.data);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-2">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm"></div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    name="email"
                    id="email"
                    value={signinData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signinData.password}
                      onChange={handleInputChange}
                      name="password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <ButtonLoading
                    loading={loading}
                    state={"Sign In"}
                    loadingstate={"Signing In..."}
                    className="w-full"
                  />
                </div>
              </div>
            </form>

            {/* <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
