export const dynamic = "force-dynamic";

import Link from "next/link";
import { Mail, Phone, Instagram, Linkedin, ArrowRight, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getData() {
  const [articlesRes, pinnedRes, bioRes, contactRes, resumeRes] = await Promise.allSettled([
    fetch(`${API}/articles`, { cache: "no-store" }),
    fetch(`${API}/articles/pinned`, { cache: "no-store" }),
    fetch(`${API}/bio`, { cache: "no-store" }),
    fetch(`${API}/contact`, { cache: "no-store" }),
    fetch(`${API}/resume`, { cache: "no-store" }),
  ]);

  const articles = articlesRes.status === "fulfilled" && articlesRes.value.ok
    ? await articlesRes.value.json().catch(() => [])
    : [];
  const pinned = pinnedRes.status === "fulfilled" && pinnedRes.value.ok
    ? await pinnedRes.value.json().catch(() => null)
    : null;
  const bio = bioRes.status === "fulfilled" && bioRes.value.ok
    ? await bioRes.value.json().catch(() => null)
    : null;
  const contact = contactRes.status === "fulfilled" && contactRes.value.ok
    ? await contactRes.value.json().catch(() => null)
    : null;
  const resumeData = resumeRes.status === "fulfilled" && resumeRes.value.ok
    ? await resumeRes.value.json().catch(() => null)
    : null;
  const resumeUrl: string | null = resumeData?.file?.asset?.url ?? null;

  return { articles: Array.isArray(articles) ? articles : [], pinned, bio, contact, resumeUrl };
}

export default async function HomePage() {
  const { articles, pinned, bio, contact, resumeUrl } = await getData();

  const recent = articles
    .filter((a: { _id: string }) => !pinned || a._id !== pinned._id)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-28 pb-24">
          <p className="text-primary text-sm font-medium mb-4 tracking-wide uppercase">
            Portfolio
          </p>
          <h1 className="text-5xl font-bold text-text-primary tracking-tight leading-tight mb-6">
            Joel Richards
          </h1>
          {bio && (
            <p className="text-text-secondary text-xl leading-relaxed max-w-2xl">
              {bio[0]?.content || bio?.content}
            </p>
          )}
          <div className="flex items-center gap-4 mt-8">
            <Link
              href="/articles"
              className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              Read articles <ArrowRight size={15} />
            </Link>
            <a
              href="/#contact"
              className="border border-border-color text-text-primary px-6 py-3 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Get in touch
            </a>
          </div>
        </section>

        {/* Articles */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-text-primary">Articles</h2>
            <Link
              href="/articles"
              className="text-sm text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {pinned && (
            <div className="mb-5">
              <ArticleCard article={pinned} />
            </div>
          )}

          {recent.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map((article: { _id: string; Title: string; content: string; slug?: { current: string }; publishedAt?: string; pinned?: boolean }) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            !pinned && (
              <p className="text-text-secondary text-sm">No articles yet.</p>
            )
          )}
        </section>

        {/* Bio */}
        {bio && (
          <section className="bg-surface">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-6">About</h2>
              <div className="max-w-2xl">
                <p className="text-text-secondary text-base leading-relaxed whitespace-pre-wrap">
                  {bio[0]?.content || bio?.content}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CV */}
        <section className="max-w-5xl mx-auto px-6 py-24 border-b border-border-color">
          <h2 className="text-2xl font-semibold text-text-primary mb-3">Resume / CV</h2>
          <p className="text-text-secondary text-sm mb-6">
            Download my resume to learn more about my experience and background.
          </p>
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border-color text-text-primary px-5 py-2.5 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              <Download size={15} />
              Download CV
            </a>
          ) : null}
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-semibold text-text-primary mb-8">Contact</h2>
          {contact ? (
            <div className="flex flex-wrap gap-4">
              {contact[0]?.email || contact?.email ? (
                <a
                  href={`mailto:${contact[0]?.email || contact?.email}`}
                  className="flex items-center gap-3 border border-border-color rounded-2xl px-5 py-4 hover:border-primary hover:text-primary group transition-colors"
                >
                  <Mail size={20} className="text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Email</p>
                    <p className="text-sm text-text-primary font-medium group-hover:text-primary transition-colors">
                      {contact[0]?.email || contact?.email}
                    </p>
                  </div>
                </a>
              ) : null}
              {contact[0]?.phone || contact?.phone ? (
                <a
                  href={`tel:${contact[0]?.phone || contact?.phone}`}
                  className="flex items-center gap-3 border border-border-color rounded-2xl px-5 py-4 hover:border-primary hover:text-primary group transition-colors"
                >
                  <Phone size={20} className="text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Phone</p>
                    <p className="text-sm text-text-primary font-medium group-hover:text-primary transition-colors">
                      {contact[0]?.phone || contact?.phone}
                    </p>
                  </div>
                </a>
              ) : null}
              {contact[0]?.instagram || contact?.instagram ? (
                <a
                  href={contact[0]?.instagram || contact?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-border-color rounded-2xl px-5 py-4 hover:border-primary hover:text-primary group transition-colors"
                >
                  <Instagram size={20} className="text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Instagram</p>
                    <p className="text-sm text-text-primary font-medium group-hover:text-primary transition-colors">
                      View profile
                    </p>
                  </div>
                </a>
              ) : null}
              {contact[0]?.linkedin || contact?.linkedin ? (
                <a
                  href={contact[0]?.linkedin || contact?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-border-color rounded-2xl px-5 py-4 hover:border-primary hover:text-primary group transition-colors"
                >
                  <Linkedin size={20} className="text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">LinkedIn</p>
                    <p className="text-sm text-text-primary font-medium group-hover:text-primary transition-colors">
                      View profile
                    </p>
                  </div>
                </a>
              ) : null}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Contact information not available.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
