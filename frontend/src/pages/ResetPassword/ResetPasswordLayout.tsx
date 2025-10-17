import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../AuthPages/AuthPageLayout";
import ResetPassword from "./ResetPassword";

export default function ResetPasswordLayout() {
  return (
    <>
      <PageMeta
        title="Reset Password | Inventa Inventory Management System"
        description="Access your Inventa account to manage products, categories, and inventory efficiently. Secure and reliable inventory management made simple."
      />
      <AuthLayout>
        <ResetPassword />
      </AuthLayout>
    </>
  );
}
