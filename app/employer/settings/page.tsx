"use client";

import React from "react";
import CompanySettingsForm from "@/components/employer/CompanySettingsForm";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function EmployerSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
        <p className="text-muted mt-2 text-sm">Manage your public company profile and branding for the candidate experience.</p>
      </div>

      {/* Main Profile Form */}
      <div className="mb-12">
        <CompanySettingsForm />
      </div>

      {/* Billing & Subscriptions Section */}
      <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-xl mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Billing & Subscriptions
              </h2>
              <span className="bg-primary/20 text-primary-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 border border-primary/30">
                <ShieldCheck className="w-3 h-3" /> Current Plan: Forge Starter
              </span>
            </div>
            <p className="text-sm text-muted">
              Manage your payment methods, upgrade your subscription, and download invoices via Lemon Squeezy.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              className="gap-2 border-white/10 hover:bg-white/5 opacity-70 cursor-not-allowed" 
              disabled
            >
              Manage Billing (Lemon Squeezy) <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
