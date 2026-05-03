"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  Globe, 
  Mail, 
  UploadCloud, 
  Loader2, 
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { 
  getEmployerProfile, 
  updateEmployerProfile, 
  uploadCompanyLogo,
  UpdateEmployerDTO
} from "@/lib/services/employerProfileService";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

const employerSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  website_url: z.string().url("Must be a valid URL").or(z.literal("")),
  contact_email: z.string().email("Invalid email address"),
  industry: z.string().optional(),
  description: z.string().optional(),
  company_logo_url: z.string().optional(),
});

type EmployerFormValues = z.infer<typeof employerSchema>;

export default function CompanySettingsForm() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase.auth]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["employerProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await getEmployerProfile(userId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!userId,
  });

  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      company_name: "",
      website_url: "",
      contact_email: "",
      industry: "",
      description: "",
      company_logo_url: "",
    },
  });

  // Update form defaults once data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || "",
        website_url: profile.website_url || "",
        contact_email: profile.contact_email || "",
        industry: profile.industry || "",
        description: profile.description || "",
        company_logo_url: profile.company_logo_url || "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateEmployerDTO) => {
      if (!userId) throw new Error("User not found");
      const { data: result, error } = await updateEmployerProfile(userId, data);
      if (error) throw new Error(error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employerProfile", userId] });
      addToast("Company profile updated successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message, "error");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("User not found");
      const { data, error } = await uploadCompanyLogo(userId, file);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (url) => {
      form.setValue("company_logo_url", url || undefined, { shouldDirty: true });
      addToast("Logo uploaded successfully!", "success");
    },
    onError: (error: Error) => {
      addToast("Upload failed: " + error.message, "error");
    },
  });

  const onSubmit = (data: EmployerFormValues) => {
    updateMutation.mutate(data);
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const logoUrl = form.watch("company_logo_url");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Logo Section */}
      <div className="lg:col-span-1">
        <div className="bg-surface border border-white/10 rounded-2xl p-6 text-center shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 font-mono">
            Company Logo
          </h3>
          <div 
            className={`relative w-32 h-32 mx-auto rounded-2xl border-2 border-dashed bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
              uploadMutation.isPending ? "border-primary/50" : "border-white/10 hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleUploadLogo} 
              accept="image/*"
            />
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : logoUrl ? (
              <>
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadCloud className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-muted mb-2 group-hover:text-primary transition-colors" />
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Upload Logo</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-muted mt-4 font-mono">Recommended: 400x400px PNG or JPG.</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="lg:col-span-2">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-surface border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> Company Name
              </label>
              <input 
                {...form.register("company_name")}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
              />
              {form.formState.errors.company_name && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Website
              </label>
              <input 
                {...form.register("website_url")}
                placeholder="https://acme.com"
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
              />
              {form.formState.errors.website_url && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.website_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Public Contact Email
              </label>
              <input 
                {...form.register("contact_email")}
                placeholder="hiring@acme.com"
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
              />
              {form.formState.errors.contact_email && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.contact_email.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Industry</label>
              <input 
                {...form.register("industry")}
                placeholder="e.g. Technology, Healthcare"
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
              />
              {form.formState.errors.industry && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.industry.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company Description</label>
              <textarea 
                {...form.register("description")}
                rows={5}
                placeholder="Tell candidates about your mission, culture, and what it's like to work at your company..."
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none text-sm leading-relaxed"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <Button 
              type="submit" 
              disabled={updateMutation.isPending || !form.formState.isDirty} 
              className="gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {updateMutation.isPending ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
