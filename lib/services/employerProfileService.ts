import { createClient } from "@/lib/supabase/client";

export interface EmployerProfile {
  id: string;
  company_name: string | null;
  company_logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  description: string | null;
  industry: string | null;
  is_verified: boolean | null;
  ls_subscription_status: string | null;
}

export interface UpdateEmployerDTO {
  company_name?: string;
  website_url?: string;
  contact_email?: string;
  description?: string;
  industry?: string;
  company_logo_url?: string;
}

export type ServiceResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Fetch the employer profile.
 */
export async function getEmployerProfile(userId: string): Promise<ServiceResponse<EmployerProfile>> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('employers')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Update the employer profile.
 */
export async function updateEmployerProfile(userId: string, profileData: UpdateEmployerDTO): Promise<ServiceResponse<EmployerProfile>> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('employers')
      .upsert({
        id: userId,
        ...profileData,
      } as any)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Upload a logo to the `logos` bucket and return the public URL.
 */
export async function uploadCompanyLogo(userId: string, file: File): Promise<ServiceResponse<string>> {
  const supabase = createClient();
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
    
    return { data: urlData.publicUrl, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
