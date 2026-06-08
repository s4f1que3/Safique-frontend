"use client";

import { useState } from "react";
import { Upload, X, FileText } from "lucide-react";

interface ArticleFormProps {
  initialData?: {
    title?: string;
    content?: string;
    thumbnailUrl?: string;
    thumbnailKey?: string;
    existingImages?: { _key: string; url: string }[];
    existingFiles?: { _key: string; url: string; originalFilename: string }[];
  };
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function ArticleForm({
  initialData,
  onSubmit,
  submitLabel = "Publish",
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [removedImageKeys, setRemovedImageKeys] = useState<Set<string>>(new Set());
  const [removedFileKeys, setRemovedFileKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = "";
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = "";
  };

  const removeExistingImage = (key: string) => {
    setRemovedImageKeys((prev) => new Set([...prev, key]));
  };

  const removeExistingFile = (key: string) => {
    setRemovedFileKeys((prev) => new Set([...prev, key]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      if (thumbnail) fd.append("thumbnail", thumbnail);
      if (removeThumbnail) fd.append("remove_thumbnail", "true");
      images.forEach((img) => fd.append("images", img));
      files.forEach((f) => fd.append("files", f));
      if (removedImageKeys.size > 0)
        fd.append("remove_image_keys", JSON.stringify([...removedImageKeys]));
      if (removedFileKeys.size > 0)
        fd.append("remove_file_keys", JSON.stringify([...removedFileKeys]));
      await onSubmit(fd);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const existingImages = (initialData?.existingImages ?? []).filter(
    (img) => !removedImageKeys.has(img._key)
  );
  const existingFiles = (initialData?.existingFiles ?? []).filter(
    (f) => !removedFileKeys.has(f._key)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-text-secondary"
          placeholder="Article title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Content <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={14}
          className="w-full border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-text-secondary"
          placeholder="Write your article here…"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Thumbnail
        </label>
        <div className="border border-dashed border-border-color rounded-xl p-4">
          <label
            htmlFor="thumbnail-upload"
            className="flex items-center gap-2 cursor-pointer text-text-secondary text-sm hover:text-primary transition-colors w-fit"
          >
            <Upload size={15} />
            <span>
              {thumbnail
                ? "Replace thumbnail"
                : initialData?.thumbnailUrl && !removeThumbnail
                ? "Replace thumbnail"
                : "Add thumbnail"}
            </span>
          </label>
          <input
            id="thumbnail-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setThumbnail(e.target.files?.[0] || null);
              setRemoveThumbnail(false);
            }}
            className="hidden"
          />

          {!thumbnail && !removeThumbnail && initialData?.thumbnailUrl && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={initialData.thumbnailUrl}
                alt="Current thumbnail"
                className="w-20 h-14 object-cover rounded-lg border border-border-color"
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary">
                  Current — upload a new one to replace
                </span>
                <button
                  type="button"
                  onClick={() => setRemoveThumbnail(true)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 w-fit"
                >
                  <X size={11} /> Remove thumbnail
                </button>
              </div>
            </div>
          )}

          {removeThumbnail && !thumbnail && (
            <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <span>Thumbnail will be removed.</span>
              <button
                type="button"
                onClick={() => setRemoveThumbnail(false)}
                className="text-primary hover:underline"
              >
                Undo
              </button>
            </div>
          )}

          {thumbnail && (
            <div className="mt-3 flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-text-secondary w-fit">
              {thumbnail.name}
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Images{" "}
          <span className="text-text-secondary font-normal">(max 5)</span>
        </label>
        <div className="border border-dashed border-border-color rounded-xl p-4">
          <label
            htmlFor="img-upload"
            className="flex items-center gap-2 cursor-pointer text-text-secondary text-sm hover:text-primary transition-colors w-fit"
          >
            <Upload size={15} />
            <span>Add images</span>
          </label>
          <input
            id="img-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={addImages}
            className="hidden"
          />
          {existingImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div key={img._key} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="Uploaded image"
                    className="w-20 h-14 object-cover rounded-lg border border-border-color"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img._key)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-text-secondary"
                >
                  {img.name}
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Files */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Files{" "}
          <span className="text-text-secondary font-normal">(max 5)</span>
        </label>
        <div className="border border-dashed border-border-color rounded-xl p-4">
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 cursor-pointer text-text-secondary text-sm hover:text-primary transition-colors w-fit"
          >
            <Upload size={15} />
            <span>Add files</span>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={addFiles}
            className="hidden"
          />
          {existingFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {existingFiles.map((f) => (
                <div key={f._key} className="flex items-center gap-1 group">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    <FileText size={11} />
                    {f.originalFilename}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(f._key)}
                    className="p-0.5 text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-text-secondary"
                >
                  {f.name}
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
