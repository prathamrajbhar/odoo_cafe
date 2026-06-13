import SignupForm from "@/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup - Odoo POS",
};

export default function SignupPage() {
  return <SignupForm />;
}
