import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { toast } from "react-toastify";
import ButtonLoading from "../../components/common/ButtonLoading";
import { handleError } from "../../utils/handleError";
import {
  requestPasswordResetService,
  confirmPasswordResetService,
} from "../../services/resetpasswordservices";
import { all_routes } from "../../Router/allroutes";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Token + Password
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [resetData, setResetData] = useState({
    email: "",
    token: "",
    new_password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Request reset token
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!resetData.email.trim()) {
      toast.error("Please enter your email");
      setLoading(false);
      return;
    }

    try {
      await requestPasswordResetService(resetData.email);
      toast.success("Reset code sent to your email!");
      setStep(2);
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };


  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!resetData.token.trim()) {
      toast.error("Please enter the reset code");
      setLoading(false);
      return;
    }

    if (!resetData.new_password.trim()) {
      toast.error("Please enter new password");
      setLoading(false);
      return;
    }

    if (resetData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordResetService(resetData);
      toast.success(
        "Password reset successfully! Please login with your new password."
      );
      navigate(all_routes.signIn);
    } catch (error: any) {
      console.error("Error resetting password:", error);
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
              {step === 1 ? "Reset Password" : "Enter Reset Code"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1
                ? "Enter your email address to receive a reset code"
                : "Enter the code sent to your email and your new password"}
            </p>
          </div>

          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>

            {step === 1 && (
              <form onSubmit={handleEmailSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="info@gmail.com"
                      name="email"
                      id="email"
                      type="email"
                      value={resetData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <ButtonLoading
                      loading={loading}
                      state={"Send Reset Code"}
                      loadingstate={"Sending..."}
                      className="w-full"
                    />
                  </div>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="info@gmail.com"
                      name="email"
                      id="email"
                      type="email"
                      value={resetData.email}
                      onChange={handleInputChange}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <Label>
                      Reset Code <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter the code sent to your email"
                      name="token"
                      id="token"
                      value={resetData.token}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label>
                      New Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={resetData.new_password}
                        onChange={handleInputChange}
                        name="new_password"
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
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Change Email?
                    </button>
                  </div>

                  <div>
                    <ButtonLoading
                      loading={loading}
                      state={"Reset Password"}
                      loadingstate={"Resetting..."}
                      className="w-full"
                    />
                  </div>
                </div>
              </form>
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Remember your password? {""}
                <Link
                  to={all_routes.signIn}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
