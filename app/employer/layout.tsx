import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import Providers from "@/components/Providers";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!employer) redirect("/auth");

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
