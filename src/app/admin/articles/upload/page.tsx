"use client";

import { useRouter } from "next/navigation";
import UploadedArticleForm from "@/components/UploadedArticleForm";
import { uploadedArticlesAPI } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UploadArticlePage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    await uploadedArticlesAPI.create(formData);
    router.push("/admin/articles");
    router.refresh();
  };

  return (
    <div className="p-10 max-w-3xl">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-text-secondary text-sm hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Back to articles
      </Link>
      <h1 className="text-2xl font-semibold text-text-primary mb-8">Upload article</h1>
      <UploadedArticleForm onSubmit={handleSubmit} submitLabel="Upload article" />
    </div>
  );
}
