import type { Metadata } from "next";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "CV Manager — UpnAbove",
  description: "Manage your resumes and CVs on UpnAbove.",
};

const mockCVs = [
  {
    name: "Resume_2026_FullStack.pdf",
    uploaded: "Mar 12, 2026",
    size: "245 KB",
    isDefault: true,
  },
  {
    name: "CV_Product_Design.pdf",
    uploaded: "Mar 8, 2026",
    size: "320 KB",
    isDefault: false,
  },
];

export default function CVsPage() {
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
      <div className="mb-8 p-8 rounded-2xl border-2 border-dashed border-border bg-surface hover:border-primary/40 transition-colors text-center cursor-pointer">
        <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">
          Drop your CV here, or click to browse
        </p>
        <p className="text-xs text-muted mt-1">
          PDF, DOC, or DOCX (max 5MB)
        </p>
      </div>

      {/* CV list */}
      <div className="space-y-3">
        {mockCVs.map((cv) => (
          <div
            key={cv.name}
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
                  {cv.isDefault && (
                    <Badge variant="primary">Default</Badge>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {cv.uploaded} · {cv.size}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
