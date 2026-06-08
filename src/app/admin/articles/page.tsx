"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pin, PinOff, Trash2, Pencil } from "lucide-react";
import { articlesAPI, uploadedArticlesAPI } from "@/lib/api";

interface ArticleItem {
  _id: string;
  Title: string;
  content?: string;
  pinned?: boolean;
  publishedAt?: string;
  _type: "article" | "uploaded_article";
}

export default function AdminArticlesPage() {
  const [allArticles, setAllArticles] = useState<ArticleItem[]>([]);
  const [pinnedRegular, setPinnedRegular] = useState<ArticleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [all, pin, uploaded] = await Promise.allSettled([
        articlesAPI.getAll(),
        articlesAPI.getPinned(),
        uploadedArticlesAPI.getAll(),
      ]);
      const regular = (
        all.status === "fulfilled" && Array.isArray(all.value) ? all.value : []
      ).map((a: Omit<ArticleItem, "_type">) => ({ ...a, _type: "article" as const }));
      const uploadedItems = (
        uploaded.status === "fulfilled" && Array.isArray(uploaded.value) ? uploaded.value : []
      ).map((a: Omit<ArticleItem, "_type">) => ({ ...a, _type: "uploaded_article" as const }));
      setAllArticles([...regular, ...uploadedItems]);
      setPinnedRegular(pin.status === "fulfilled" ? pin.value : null);
    } catch {
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: ArticleItem) => {
    if (!confirm("Delete this article?")) return;
    try {
      if (item._type === "article") {
        await articlesAPI.delete(item._id);
      } else {
        await uploadedArticlesAPI.delete(item._id);
      }
      load();
    } catch {
      alert("Failed to delete article");
    }
  };

  const handlePin = async (item: ArticleItem) => {
    if (item._type === "article") {
      const isPinned = pinnedRegular?._id === item._id;
      setPinnedRegular(isPinned ? null : item);
      try {
        if (isPinned) {
          await articlesAPI.unpin(item._id);
        } else {
          await articlesAPI.pin(item._id);
        }
      } catch (err: unknown) {
        load();
        alert(err instanceof Error ? err.message : "Failed to update pin");
      }
    } else {
      const isPinned = item.pinned;
      setAllArticles((prev) =>
        prev.map((a) => (a._id === item._id ? { ...a, pinned: !isPinned } : a))
      );
      try {
        if (isPinned) {
          await uploadedArticlesAPI.unpin(item._id);
        } else {
          await uploadedArticlesAPI.pin(item._id);
        }
      } catch (err: unknown) {
        load();
        alert(err instanceof Error ? err.message : "Failed to update pin");
      }
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
    <div className="p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Articles</h1>
          <p className="text-text-secondary text-sm">
            {allArticles.length} article{allArticles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/upload"
            className="flex items-center gap-2 border border-border-color text-text-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-surface transition-colors"
          >
            <Plus size={15} />
            Upload article
          </Link>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus size={15} />
            New article
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {allArticles.length === 0 ? (
        <div className="border border-dashed border-border-color rounded-2xl p-12 text-center">
          <p className="text-text-secondary text-sm mb-4">No articles yet.</p>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus size={15} />
            Write your first article
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allArticles.map((article) => {
            const isPinned =
              article._type === "article"
                ? pinnedRegular?._id === article._id
                : article.pinned === true;
            return (
              <div
                key={article._id}
                className="border border-border-color rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {isPinned && <Pin size={12} className="text-accent shrink-0" />}
                    <h3 className="text-text-primary font-medium text-sm truncate">
                      {article.Title}
                    </h3>
                  </div>
                  {article.content && (
                    <p className="text-text-secondary text-xs truncate">
                      {article.content.substring(0, 80)}…
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handlePin(article)}
                    title={isPinned ? "Unpin" : "Pin"}
                    className={`p-2 rounded-lg transition-colors ${
                      isPinned
                        ? "text-accent hover:bg-accent/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface"
                    }`}
                  >
                    {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                  </button>
                  <Link
                    href={
                      article._type === "article"
                        ? `/admin/articles/${article._id}/edit`
                        : `/admin/articles/${article._id}/edit-uploaded`
                    }
                    className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(article)}
                    className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
