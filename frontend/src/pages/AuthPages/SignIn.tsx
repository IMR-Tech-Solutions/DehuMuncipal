import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Inventa Inventory Management System"
        description="Access your Inventa account to manage products, categories, and inventory efficiently. Secure and reliable inventory management made simple."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
