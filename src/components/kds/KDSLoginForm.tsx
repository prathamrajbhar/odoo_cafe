"use client";

import React, { useState } from "react";

export default function KDSLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Invalid credentials");
        return;
      }

      const role = json.data?.role;
      if (role !== "KITCHEN" && role !== "ADMIN") {
        // Log out immediately — wrong role
        await fetch("/api/auth/logout", { method: "POST" });
        setError("Access denied. This terminal is for kitchen staff only.");
        return;
      }

      // Reload so the server layout re-reads the cookie
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-on-primary-container">
              restaurant
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-headline-sm font-bold text-on-surface">Kitchen Display</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">Sign in to access the kitchen terminal</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-body-sm">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant" htmlFor="kds-email">
              Email
            </label>
            <input
              id="kds-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
              placeholder="kitchen@cafe.local"
            />
          </div>

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant" htmlFor="kds-password">
              Password
            </label>
            <div className="relative">
              <input
                id="kds-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2.5 pr-10 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-on-primary text-label-lg font-semibold transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
