import React, { ReactNode } from "react";

export interface AuthLayoutProps {
  children: ReactNode;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  subtitle = "High-Performance Hospitality",
}) => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4 antialiased">
      <main className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-display-lg text-primary font-bold tracking-tight select-none">
            Odoo POS
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-surface-container-lowest border border-available-border rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
          {children}
        </div>

        {/* Footer / Context */}
        <div className="text-center mt-8 text-on-surface-variant/70 text-body-sm select-none">
          <p>© 2026 Odoo Cafe S.A. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
