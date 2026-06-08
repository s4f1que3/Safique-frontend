"use client";

import { useState } from "react";
import { Upload, X, FileText } from "lucide-react";

interface UploadedArticleFormProps {
  initialData?: {
    title?: string;
    pinned?: boolean;
    articleUrl?: string;
    articleFilename?: string;
    existingImages?: { url: string }[];
    existingFiles?: { url: string; originalFilename: string }[];
  };
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function UploadedArticleForm({
  initialData,
  onSubmit,
  submitLabel = "Upload",
}: UploadedArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [pinned, setPinned] = useState(initialData?.pinned ?? false);
  const [articleFile, setArticleFile] = useState<File | null>(null);
  const [removeArticle, setRemoveArticle] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<Set<string>>(new Set());
  const [removedFileUrls, setRemovedFileUrls] = useState<Set<string>>(new Set());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("pinned", String(pinned));
      if (articleFile) fd.append("article", articleFile);
      if (removeArticle) fd.append("remove_article", "true");
      images.forEach((img) => fd.append("images", img));
      files.forEach((f) => fd.append("files", f));
      if (removedImageUrls.size > 0)
        fd.append("remove_image_urls", JSON.stringify([...removedImageUrls]));
      if (removedFileUrls.size > 0)
        fd.append("remove_file_urls", JSON.stringify([...removedFileUrls]));
      await onSubmit(fd);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const existingImages = (initialData?.existingImages ?? []).filter(
    (img) => img.url && !removedImageUrls.has(img.url)
  );
  const existingFiles = (initialData?.existingFiles ?? []).filter(
    (f) => f.url && !removedFileUrls.has(f.url)
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

      {/* Article file */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Article file{" "}
          {!initialData?.articleUrl && <span className="text-red-400">*</span>}
        </label>
        <div className="border border-dashed border-border-color rounded-xl p-4">
          <label
            htmlFor="article-upload"
            className="flex items-center gap-2 cursor-pointer text-text-secondary text-sm hover:text-primary transition-colors w-fit"
          >
            <Upload size={15} />
            <span>
              {articleFile
                ? "Replace file"
                : initialData?.articleUrl && !removeArticle
                ? "Replace file"
                : "Upload file"}
            </span>
          </label>
          <input
            id="article-upload"
            type="file"
            onChange={(e) => {
              setArticleFile(e.target.files?.[0] || null);
              setRemoveArticle(false);
            }}
            className="hidden"
          />

          {!articleFile && !removeArticle && initialData?.articleUrl && (
            <div className="mt-3 flex items-center gap-3">
              <a
                href={initialData.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-text-secondary hover:text-primary transition-colors"
              >
                <FileText size={11} />
                {initialData.articleFilename ?? "Current file"}
              </a>
              <button
                type="button"
                onClick={() => setRemoveArticle(true)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <X size={11} /> Remove
              </button>
            </div>
          )}

          {removeArticle && !articleFile && (
            <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <span>File will be removed.</span>
              <button
                type="button"
                onClick={() => setRemoveArticle(false)}
                className="text-primary hover:underline"
              >
                Undo
              </button>
            </div>
          )}

          {articleFile && (
            <div className="mt-3 flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-text-secondary w-fit">
              <FileText size={11} />
              {articleFile.name}
              <button
                type="button"
                onClick={() => setArticleFile(null)}
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
                <div key={img.url} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="Uploaded image"
                    className="w-20 h-14 object-cover rounded-lg border border-border-color"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRemovedImageUrls((prev) => new Set([...prev, img.url]))
                    }
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
                <div key={f.url} className="flex items-center gap-1 group">
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
                    onClick={() =>
                      setRemovedFileUrls((prev) => new Set([...prev, f.url]))
                    }
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

      {/* Pinned */}
      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm text-text-primary">Pin this article</span>
      </label>

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
