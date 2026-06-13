"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signupSchema } from "@/schemas/auth";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export const SignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    const result = signupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const formattedErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") formattedErrors.name = err.message;
        if (err.path[0] === "email") formattedErrors.email = err.message;
        if (err.path[0] === "password") formattedErrors.password = err.message;
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response: any = await api.post("/auth/signup", { name, email, password });
      toast.success("Account created successfully! Redirecting...");
      
      const role = response.data?.role;
      setTimeout(() => {
        if (role === "ADMIN") {
          window.location.href = "/admin/products";
        } else {
          window.location.href = "/pos";
        }
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Sign up failed. Please try again.");
      setIsLoading(false);
    }
  };

  // SVGs for Icons
  const personIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name Input */}
        <Input
          label="Name"
          id="name"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          leftIcon={personIcon}
          disabled={isLoading}
          required
        />

        {/* Email Input */}
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@company.com"
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={lockIcon}
          disabled={isLoading}
          helperText="Must be at least 6 characters."
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

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isLoading}
        >
          Sign Up
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-available-border" />
          </div>
          <div className="relative flex justify-center text-body-sm">
            <span className="px-2 bg-surface-container-lowest text-on-surface-variant/70 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toast.info("Google Authentication is disabled.")}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-available-border rounded-lg shadow-sm bg-surface-bright text-label-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => toast.info("Microsoft Authentication is disabled.")}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-available-border rounded-lg shadow-sm bg-surface-bright text-label-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Microsoft
          </button>
        </div>
      </div>

      {/* Links */}
      <p className="mt-8 text-center text-body-sm text-on-surface-variant/85">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-label-md text-primary font-bold hover:text-primary-container hover:underline transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
