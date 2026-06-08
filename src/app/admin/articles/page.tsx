"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pin, PinOff, Trash2, Pencil } from "lucide-react";
import { articlesAPI } from "@/lib/api";

interface Article {
  _id: string;
  Title: string;
  content: string;
  pinned?: boolean;
  publishedAt?: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pinned, setPinned] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [all, pin] = await Promise.allSettled([
        articlesAPI.getAll(),
        articlesAPI.getPinned(),
      ]);
      setArticles(all.status === "fulfilled" && Array.isArray(all.value) ? all.value : []);
      setPinned(pin.status === "fulfilled" ? pin.value : null);
    } catch {
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      await articlesAPI.delete(id);
      load();
    } catch {
      alert("Failed to delete article");
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    if (isPinned) {
      setPinned(null);
    } else {
      setPinned(articles.find((a) => a._id === id) ?? null);
    }
    try {
      if (isPinned) {
        await articlesAPI.unpin(id);
      } else {
        await articlesAPI.pin(id);
      }
    } catch (err: unknown) {
      load();
      alert(err instanceof Error ? err.message : "Failed to update pin");
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
          <p className="text-text-secondary text-sm">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
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

      {articles.length === 0 ? (
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
          {articles.map((article) => {
            const isPinned = pinned?._id === article._id;
            return (
              <div
                key={article._id}
                className="border border-border-color rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {isPinned && (
                      <Pin size={12} className="text-accent shrink-0" />
                    )}
                    <h3 className="text-text-primary font-medium text-sm truncate">
                      {article.Title}
                    </h3>
                  </div>
                  <p className="text-text-secondary text-xs truncate">
                    {article.content?.substring(0, 80)}…
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handlePin(article._id, isPinned)}
                    title={isPinned ? "Unpin" : "Pin"}
                    className={`p-2 rounded-lg transition-colors ${isPinned ? "text-accent hover:bg-accent/10" : "text-text-secondary hover:text-text-primary hover:bg-surface"}`}
                  >
                    {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                  </button>
                  <Link
                    href={`/admin/articles/${article._id}/edit`}
                    className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(article._id)}
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
