"use client";

import React, { useState } from "react";
import Link from "next/link";
import { loginSchema } from "@/schemas/auth";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const formattedErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") formattedErrors.email = err.message;
        if (err.path[0] === "password") formattedErrors.password = err.message;
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response: any = await api.post("/auth/login", { email, password });
      toast.success("Login successful! Redirecting...");

      const role = response.data?.role;
      setTimeout(() => {
        if (role === "ADMIN") {
          window.location.href = "/admin/products";
        } else {
          window.location.href = "/pos";
        }
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  // SVGs for Icons
  const mailIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const lockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const eyeIconShow = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const eyeIconHide = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  );

  const arrowIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Email Input */}
      <Input
        label="Email"
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        leftIcon={mailIcon}
        disabled={isLoading}
        required
      />

      {/* Password Input */}
      <Input
        label="Password"
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        leftIcon={lockIcon}
        disabled={isLoading}
        rightIcon={
          <button
            type="button"
            onClick={handleTogglePassword}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-default transition-all flex items-center justify-center cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? eyeIconHide : eyeIconShow}
          </button>
        }
        required
      />

      {/* Sign In Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isLoading}
          rightIcon={arrowIcon}
        >
          Sign In
        </Button>
      </div>

      {/* Secondary Links */}
      <div className="flex items-center justify-between pt-4 border-t border-available-border mt-6">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toast.info("Password recovery is currently disabled.");
          }}
          className="text-label-md text-secondary hover:text-secondary-container transition-colors"
        >
          Forgot Password?
        </Link>
        <Link
          href="/signup"
          className="text-label-md text-primary hover:text-primary-container transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
