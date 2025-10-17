import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Inventa Inventory Management System"
        description="Create your Inventa account to manage inventory, track products, and streamline your business operations with ease."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
