"use client";

import { useEffect, useState } from "react";
import { bioAPI } from "@/lib/api";

interface Bio {
  _id: string;
  title?: string;
  content: string;
}

export default function AdminBioPage() {
  const [bio, setBio] = useState<Bio | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await bioAPI.get();
      const b = Array.isArray(data) ? data[0] : data;
      if (b) {
        setBio(b);
        setTitle(b.title || "");
        setContent(b.content || "");
      }
    } catch {
      setError("Failed to load bio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      if (bio) {
        await bioAPI.update(bio._id, { title, content });
      } else {
        await bioAPI.create({ title, content });
      }
      setSuccess(true);
      load();
    } catch {
      setError("Failed to save bio");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bio || !confirm("Delete bio?")) return;
    try {
      await bioAPI.delete(bio._id);
      setBio(null);
      setTitle("");
      setContent("");
    } catch {
      setError("Failed to delete bio");
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Bio</h1>
          <p className="text-text-secondary text-sm">
            {bio ? "Edit your biography." : "Create your biography."}
          </p>
        </div>
        {bio && (
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-text-secondary"
            placeholder="Write your bio here…"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : bio ? "Save changes" : "Create bio"}
          </button>
          {success && (
            <span className="text-green-600 text-sm">Bio saved successfully.</span>
          )}
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
