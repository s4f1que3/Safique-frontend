"use client";

import { useEffect, useState } from "react";
import { contactAPI } from "@/lib/api";
import { Trash2 } from "lucide-react";

interface Contact {
  _id?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
}

const fields = [
  { key: "phone", label: "Phone Number", placeholder: "+1 234 567 8900", type: "tel" },
  { key: "email", label: "Email Address", placeholder: "joel@example.com", type: "email" },
  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/joelrichards", type: "url" },
  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/joelrichards", type: "url" },
] as const;

type FieldKey = typeof fields[number]["key"];

export default function AdminContactPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({ phone: "", email: "", instagram: "", linkedin: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await contactAPI.get();
      const c = Array.isArray(data) ? data[0] : data;
      if (c) {
        setContact(c);
        setForm({
          phone: c.phone || "",
          email: c.email || "",
          instagram: c.instagram || "",
          linkedin: c.linkedin || "",
        });
      }
    } catch {
      setError("Failed to load contact info");
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
      if (contact) {
        await contactAPI.update({
          new_phone: form.phone,
          new_email: form.email,
          new_instagram: form.instagram,
          new_linkedin: form.linkedin,
        });
      } else {
        await contactAPI.create(form);
      }
      setSuccess(true);
      load();
    } catch {
      setError("Failed to save contact info");
    } finally {
      setSaving(false);
    }
  };

  const handleClearField = async (key: FieldKey) => {
    if (!confirm(`Remove ${key} from contact info?`)) return;
    try {
      await contactAPI.deleteField(key);
      setForm((prev) => ({ ...prev, [key]: "" }));
      load();
    } catch {
      alert("Failed to remove field");
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
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Contact</h1>
      <p className="text-text-secondary text-sm mb-8">
        {contact ? "Update your contact information." : "Add your contact information."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
            <div className="flex gap-2">
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="flex-1 border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-text-secondary"
                placeholder={placeholder}
              />
              {form[key] && (
                <button
                  type="button"
                  onClick={() => handleClearField(key)}
                  className="p-3 border border-border-color rounded-xl text-text-secondary hover:text-red-500 hover:border-red-200 transition-colors"
                  title={`Remove ${label}`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : contact ? "Save changes" : "Create contact"}
          </button>
          {success && (
            <span className="text-green-600 text-sm">Contact info saved.</span>
          )}
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
