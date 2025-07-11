import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-[#0A51A1] sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row bg-[#0A51A1] sm:p-0">
        {children}
      </div>
    </div>
  );
}