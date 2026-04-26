"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Globe, 
  Mail, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  Save,
  AlertCircle
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function EmployerSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [employer, setEmployer] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    company_name: "",
    website_url: "",
    contact_email: "",
    industry: "",
    description: "",
    company_logo_url: ""
  });

  useEffect(() => {
    async function loadEmployer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        addToast("Error loading profile: " + error.message, "error");
      }

      if (data) {
        setEmployer(data);
        setFormData({
          company_name: data.company_name || "",
          website_url: data.website_url || "",
          contact_email: data.contact_email || "",
          industry: data.industry || "",
          description: data.description || "",
          company_logo_url: data.company_logo_url || ""
        });
      } else {
        // No employer record yet, use user email as default contact
        setFormData(prev => ({ ...prev, contact_email: user.email || "" }));
      }
      setLoading(false);
    }
    loadEmployer();
  }, [supabase, router]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, company_logo_url: urlData.publicUrl }));
      addToast("Logo uploaded successfully!", "success");
    } catch (err: any) {
      addToast("Upload failed: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('employers')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      addToast("Company profile updated!", "success");
    } catch (err: any) {
      addToast("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
        <p className="text-muted mt-1">Manage your public company profile and branding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Section */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Company Logo</h3>
            <div 
              className="relative w-32 h-32 mx-auto rounded-2xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleUploadLogo} 
                accept="image/*"
              />
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : formData.company_logo_url ? (
                <>
                  <img 
                    src={formData.company_logo_url} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                    <UploadCloud className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase">Change</span>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-muted mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-muted font-bold uppercase">Upload Logo</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-muted mt-4 font-mono">Recommended: 400x400px PNG or JPG.</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6 bg-surface border border-border rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Company Name
                </label>
                <input 
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                <input 
                  type="url"
                  value={formData.website_url}
                  onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://acme.com"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Public Contact Email
                </label>
                <input 
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="hiring@acme.com"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Industry</label>
                <input 
                  type="text"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Technology, Healthcare"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company Description</label>
                <textarea 
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell candidates about your mission, culture, and what it's like to work at your company..."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving Changes..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
