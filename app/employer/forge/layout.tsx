import React from "react";

export default function EmployerForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-[#05050a] text-white font-sans w-full relative">
       {children}
    </div>
  );
}
