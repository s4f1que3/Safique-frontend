"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import UploadedArticleForm from "@/components/UploadedArticleForm";
import { uploadedArticlesAPI } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface UploadedArticle {
  _id: string;
  Title: string;
  pinned?: boolean;
  articleUrl?: string;
  articleFilename?: string;
  imageItems?: { url: string }[];
  fileItems?: { url: string; originalFilename: string }[];
}

export default function EditUploadedArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<UploadedArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    uploadedArticlesAPI
      .getById(id)
      .then(setArticle)
      .catch(() => router.push("/admin/articles"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    const editData = new FormData();
    editData.append("new_title", formData.get("title") as string);
    editData.append("new_pinned", formData.get("pinned") as string);
    const articleFile = formData.get("article");
    if (articleFile instanceof File) editData.append("article", articleFile);
    formData.getAll("images").forEach((img) => editData.append("images", img));
    formData.getAll("files").forEach((f) => editData.append("files", f));
    const removeArticle = formData.get("remove_article");
    if (removeArticle) editData.append("remove_article", removeArticle as string);
    const removeImageUrls = formData.get("remove_image_urls");
    if (removeImageUrls) editData.append("remove_image_urls", removeImageUrls as string);
    const removeFileUrls = formData.get("remove_file_urls");
    if (removeFileUrls) editData.append("remove_file_urls", removeFileUrls as string);
    await uploadedArticlesAPI.update(id, editData);
    router.push("/admin/articles");
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-2 text-text-secondary text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Loading…
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="p-10 max-w-3xl">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-text-secondary text-sm hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Back to articles
      </Link>
      <h1 className="text-2xl font-semibold text-text-primary mb-8">Edit uploaded article</h1>
      <UploadedArticleForm
        initialData={{
          title: article.Title,
          pinned: article.pinned,
          articleUrl: article.articleUrl,
          articleFilename: article.articleFilename,
          existingImages: article.imageItems ?? [],
          existingFiles: article.fileItems ?? [],
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
