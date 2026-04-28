"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Trash2, Download, Loader2, Inbox, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

interface CV {
  name: string;
  fullPath: string;
  size: number;
  created_at: string;
  publicUrl: string;
}

export default function CVsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultCvUrl, setDefaultCvUrl] = useState<string | null>(null);
  const loadCVs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
         setLoading(false);
         return;
      }
      const user = session.user;
      setUserId(user.id);

      // Fetch candidate's current default resume
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('resume_url')
        .eq('id', user.id)
        .maybeSingle();
      
      if (candidate?.resume_url) {
         setDefaultCvUrl(candidate.resume_url);
      }

      const { data: files, error } = await supabase.storage
        .from('cvs')
        .list(user.id, { sortBy: { column: 'created_at', order: 'desc' } });

      if (!error && files) {
        const cvList = files.map(f => {
          const fullPath = `${user.id}/${f.name}`;
          const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(fullPath);
          return {
            name: f.name,
            fullPath,
            size: f.metadata?.size || 0,
            created_at: f.created_at || '',
            publicUrl: urlData.publicUrl
          };
        });
        setCvs(cvList);
        
        // Auto-set default if they only have 1 CV and no default is set
        if (cvList.length === 1 && !candidate?.resume_url) {
          handleSetDefault(cvList[0].publicUrl, false);
        }
      }
    } catch (err) {
      console.error("Error loading CVs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCVs();
  }, [supabase]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress bar for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
         if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
         }
         return prev + 10;
      });
    }, 200);

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error, data } = await supabase.storage
      .from('cvs')
      .upload(`${userId}/${fileName}`, file);
      
    clearInterval(progressInterval);

    if (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } else {
      setUploadProgress(100);
      const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(`${userId}/${fileName}`);
      
      // Automatically make it the default if it's their first CV
      if (cvs.length === 0) {
        await handleSetDefault(urlData.publicUrl, false);
      }
      
      setTimeout(() => {
        alert(`Successfully uploaded ${file.name}`);
        loadCVs();
      }, 300);
    }
    
    setTimeout(() => {
       setUploading(false);
       setUploadProgress(0);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1000);
  }

  async function handleDelete(fullPath: string, publicUrl: string) {
    if (!confirm('Are you sure you want to delete this CV?')) return;

    const { error } = await supabase.storage
      .from('cvs')
      .remove([fullPath]);

    if (!error) {
      setCvs(cvs.filter(cv => cv.fullPath !== fullPath));
      // If deleted CV was default, clear default
      if (defaultCvUrl === publicUrl) {
         await supabase.from('candidates').update({ resume_url: null }).eq('id', userId!);
         setDefaultCvUrl(null);
      }
    } else {
      alert(`Failed to delete CV: ${error.message}`);
    }
  }

  async function handleSetDefault(publicUrl: string, showToast = true) {
     if (!userId) return;
     
     const { data, error } = await supabase
        .from('candidates')
        .update({ resume_url: publicUrl })
        .eq('id', userId)
        .select('id');
     
     if (error) {
        if (showToast) alert('Failed to set default: ' + error.message);
        return;
     }

     if (!data || data.length === 0) {
        // Automatically create a base candidate profile if one doesn't exist
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
           const email = user.email || `user_${userId}@placeholder.com`;
           const fullName = user.user_metadata?.full_name || 'Anonymous User';
           const firstName = fullName.split(' ')[0] || 'Anonymous';
           const lastName = fullName.split(' ').slice(1).join(' ') || 'User';

           const { error: insertError } = await supabase.from('candidates').insert({
              id: userId,
              first_name: firstName,
              last_name: lastName,
              email: email,
              resume_url: publicUrl
           });
           
           if (insertError) {
              if (showToast) alert('Failed to create profile and set default CV: ' + insertError.message);
              return;
           }
        } else {
           if (showToast) alert('You must complete your candidate profile in the settings before you can set a default CV.');
           return;
        }
     }

     setDefaultCvUrl(publicUrl);

     // Trigger PDF text extraction in the background for employer keyword search
     fetch('/api/cvs/extract', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ resumeUrl: publicUrl }),
     }).catch(err => console.error('CV extraction failed silently:', err));

     if (showToast) alert('Set as default CV.');
  }

  async function handleDownload(fullPath: string, name: string) {
    const { data } = await supabase.storage
      .from('cvs')
      .download(fullPath);

    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CV Manager</h1>
          <p className="mt-1 text-muted">
            Upload and manage your resumes
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`mb-8 p-8 rounded-2xl border-2 border-dashed transition-colors text-center cursor-pointer relative overflow-hidden ${uploading ? 'border-primary/50 bg-primary/5 pointer-events-none' : 'border-border bg-surface hover:border-primary/40'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading && (
           <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
        )}

        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-sm font-bold text-primary">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <>
             <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
             <p className="text-sm font-medium text-foreground">
               Drop your CV here, or click to browse
             </p>
             <p className="text-xs text-muted mt-1">
               PDF ONLY (max 10MB)
             </p>
          </>
        )}
      </div>

      {/* CV list */}
      {cvs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-border border-dashed rounded-2xl bg-surface/50">
          <Inbox className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No CVs uploaded</h3>
          <p className="text-sm text-muted">Upload your first CV to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cvs.map((cv) => {
             // Compare using fullPath to avoid localhost vs production domain mismatches
             const isDefault = defaultCvUrl && defaultCvUrl.includes(cv.fullPath);
             return (
               <div
                 key={cv.fullPath}
                 className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border ${isDefault ? 'border-primary/50 bg-primary/5' : 'border-border bg-background'}`}
               >
                 <div className="flex items-center gap-4 mb-4 sm:mb-0">
                   <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isDefault ? 'bg-primary text-white' : 'bg-primary-100 text-primary dark:bg-primary-900/30'}`}>
                     <FileText className="w-6 h-6" />
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                         {cv.name}
                       </p>
                       {isDefault && (
                         <Badge variant="primary" className="flex items-center gap-1 px-2 py-0.5"><Star className="w-3 h-3 fill-current" /> Default</Badge>
                       )}
                     </div>
                     <p className="text-xs text-muted mt-1">
                       {cv.created_at ? new Date(cv.created_at).toLocaleDateString() : '—'} · {formatFileSize(cv.size)}
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                   {!isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(cv.publicUrl)}>
                         Set Default
                      </Button>
                   )}
                   <Button variant="ghost" size="sm" onClick={() => handleDownload(cv.fullPath, cv.name)} title="Download">
                     <Download className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => handleDelete(cv.fullPath, cv.publicUrl)} title="Delete">
                     <Trash2 className="w-4 h-4 text-red-500" />
                   </Button>
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
