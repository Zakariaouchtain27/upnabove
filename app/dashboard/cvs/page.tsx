"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Trash2, Download, Loader2, Inbox } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

interface CV {
  name: string;
  fullPath: string;
  size: number;
  created_at: string;
}

export default function CVsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCVs();
  }, []);

  async function loadCVs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: files, error } = await supabase.storage
      .from('cvs')
      .list(user.id, { sortBy: { column: 'created_at', order: 'desc' } });

    if (!error && files) {
      setCvs(files.map(f => ({
        name: f.name,
        fullPath: `${user.id}/${f.name}`,
        size: f.metadata?.size || 0,
        created_at: f.created_at || '',
      })));
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB.');
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error, data } = await supabase.storage
      .from('cvs')
      .upload(`${userId}/${fileName}`, file);

    if (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } else {
      const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(`${userId}/${fileName}`);
      
      const { error: dbError } = await supabase
        .from('candidates')
        .update({ resume_url: urlData.publicUrl })
        .eq('user_id', userId);

      if (dbError) {
         console.error('Failed to update candidate profile:', dbError);
         alert(`CV uploaded, but failed to link to profile: ${dbError.message}`);
      } else {
         alert('CV uploaded and linked to your profile successfully! (Public URL saved)');
      }
      
      await loadCVs();
    }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDelete(fullPath: string) {
    if (!confirm('Are you sure you want to delete this CV?')) return;

    const { error } = await supabase.storage
      .from('cvs')
      .remove([fullPath]);

    if (!error) {
      setCvs(cvs.filter(cv => cv.fullPath !== fullPath));
    }
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
        onClick={() => fileInputRef.current?.click()}
        className="mb-8 p-8 rounded-2xl border-2 border-dashed border-border bg-surface hover:border-primary/40 transition-colors text-center cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
        ) : (
          <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? 'Uploading...' : 'Drop your CV here, or click to browse'}
        </p>
        <p className="text-xs text-muted mt-1">
          PDF, DOC, or DOCX (max 5MB)
        </p>
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
          {cvs.map((cv, idx) => (
            <div
              key={cv.fullPath}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-background"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {cv.name}
                    </p>
                    {idx === 0 && (
                      <Badge variant="primary">Latest</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {cv.created_at ? new Date(cv.created_at).toLocaleDateString() : '—'} · {formatFileSize(cv.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(cv.fullPath, cv.name)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(cv.fullPath)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
