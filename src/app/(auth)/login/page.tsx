import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Odoo Cafe",
};

export default function LoginPage() {
  return <LoginForm />;
}
