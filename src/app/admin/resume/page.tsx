"use client";

import { useEffect, useRef, useState } from "react";
import { resumeAPI } from "@/lib/api";
import { Upload, Trash2, FileText } from "lucide-react";

interface Resume {
  _id: string;
  file?: {
    asset?: {
      url?: string;
      originalFilename?: string;
    };
  };
}

export default function AdminResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await resumeAPI.get();
      setResume(data || null);
    } catch {
      setError("Failed to load resume");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await resumeAPI.upload(formData);
      await load();
    } catch {
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove the current resume?")) return;
    try {
      await resumeAPI.delete();
      setResume(null);
    } catch {
      setError("Failed to delete resume");
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-2 text-text-secondary text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="p-10 max-w-2xl">
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Resume / CV</h1>
      <p className="text-text-secondary text-sm mb-8">Upload or replace your CV file.</p>

      {resume?.file?.asset ? (
        <div className="border border-border-color rounded-2xl px-6 py-5 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-text-primary text-sm font-medium">
                {resume.file.asset.originalFilename ?? "resume.pdf"}
              </p>
              {resume.file.asset.url && (
                <a
                  href={resume.file.asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Preview
                </a>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove resume"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-border-color rounded-2xl p-12 text-center mb-6">
          <p className="text-text-secondary text-sm mb-4">No resume uploaded yet.</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className={`flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload size={15} />
          {uploading ? "Uploading…" : resume?.file?.asset ? "Replace file" : "Upload file"}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  );
}
