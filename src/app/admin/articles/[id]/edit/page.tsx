"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";
import { articlesAPI } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Article {
  _id: string;
  Title: string;
  content: string;
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesAPI
      .getById(id)
      .then(setArticle)
      .catch(() => router.push("/admin/articles"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    await articlesAPI.update(id, formData);
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
      <h1 className="text-2xl font-semibold text-text-primary mb-8">Edit article</h1>
      <ArticleForm
        initialData={{ title: article.Title, content: article.content }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
