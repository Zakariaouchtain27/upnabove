import React from "react";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import Providers from "@/components/Providers";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-16">
      <EmployerSidebar />
      <main className="flex-1 w-full bg-background transition-colors min-w-0">
        <Providers>
          {children}
        </Providers>
      </main>
    </div>
  );
}
