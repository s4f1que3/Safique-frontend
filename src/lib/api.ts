const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const session = await res.json();
    localStorage.setItem("token", session.access_token);
    if (session.refresh_token) localStorage.setItem("refresh_token", session.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string> ?? {}) },
  });
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return fetch(url, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers as Record<string, string> ?? {}) },
      });
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  }
  return res;
}

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "Request failed");
    throw new Error(text || "Request failed");
  }
  return res.json().catch(() => null);
}

export const articlesAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/articles`).then(handle),

  getBySlug: (slug: string) =>
    fetch(`${BASE_URL}/articles/${slug}`).then(handle),

  getById: (id: string) =>
    fetch(`${BASE_URL}/articles/by-id/${id}`).then(handle),

  getPinned: () =>
    fetch(`${BASE_URL}/articles/pinned`).then(handle),

  create: (formData: FormData) =>
    fetchWithAuth(`${BASE_URL}/articles/create`, { method: "POST", body: formData }).then(handle),

  update: (id: string, formData: FormData) =>
    fetchWithAuth(`${BASE_URL}/articles/update/${id}`, { method: "PATCH", body: formData }).then(handle),

  delete: (id: string) =>
    fetchWithAuth(`${BASE_URL}/articles/delete/${id}`, { method: "DELETE" }).then(handle),

  pin: (id: string) =>
    fetchWithAuth(`${BASE_URL}/articles/pin/${id}`, { method: "PATCH" }).then(handle),

  unpin: (id: string) =>
    fetchWithAuth(`${BASE_URL}/articles/unpin/${id}`, { method: "PATCH" }).then(handle),
};

export const uploadedArticlesAPI = {
  getAll: () =>
    fetchWithAuth(`${BASE_URL}/upload-article`).then(handle),

  getById: (id: string) =>
    fetchWithAuth(`${BASE_URL}/upload-article/${id}`).then(handle),

  create: (formData: FormData) =>
    fetchWithAuth(`${BASE_URL}/upload-article/create`, { method: "POST", body: formData }).then(handle),

  update: (id: string, formData: FormData) =>
    fetchWithAuth(`${BASE_URL}/upload-article/update/${id}`, { method: "PATCH", body: formData }).then(handle),

  pin: (id: string) =>
    fetchWithAuth(`${BASE_URL}/upload-article/pin/${id}`, { method: "PATCH" }).then(handle),

  unpin: (id: string) =>
    fetchWithAuth(`${BASE_URL}/upload-article/unpin/${id}`, { method: "PATCH" }).then(handle),

  delete: (id: string) =>
    fetchWithAuth(`${BASE_URL}/upload-article?id=${id}`, { method: "DELETE" }).then(handle),
};

export const bioAPI = {
  get: () =>
    fetch(`${BASE_URL}/bio`).then(handle),

  create: (data: { title: string; content: string }) =>
    fetchWithAuth(`${BASE_URL}/bio/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  update: (id: string, data: { title: string; content: string }) =>
    fetchWithAuth(`${BASE_URL}/bio/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  delete: (id: string) =>
    fetchWithAuth(`${BASE_URL}/bio/delete/${id}`, { method: "DELETE" }).then(handle),
};

export const contactAPI = {
  get: () =>
    fetch(`${BASE_URL}/contact`).then(handle),

  create: (data: { phone: string; email: string; instagram: string; linkedin: string }) =>
    fetchWithAuth(`${BASE_URL}/contact/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  update: (data: { new_phone?: string; new_email?: string; new_instagram?: string; new_linkedin?: string }) =>
    fetchWithAuth(`${BASE_URL}/contact`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  deleteField: (option: string) =>
    fetchWithAuth(`${BASE_URL}/contact/fields?option=${option}`, { method: "DELETE" }).then(handle),

  delete: () =>
    fetchWithAuth(`${BASE_URL}/contact`, { method: "DELETE" }).then(handle),
};

export const resumeAPI = {
  get: () =>
    fetch(`${BASE_URL}/resume`).then(handle),

  upload: (formData: FormData) =>
    fetchWithAuth(`${BASE_URL}/resume/upload`, { method: "POST", body: formData }).then(handle),

  delete: () =>
    fetchWithAuth(`${BASE_URL}/resume`, { method: "DELETE" }).then(handle),
};

export const authAPI = {
  signIn: (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  signOut: () =>
    fetchWithAuth(`${BASE_URL}/auth/sign-out`, { method: "POST" }).then(handle),

  verifyPassword: (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  sendOtp: (email: string, password: string) =>
    fetchWithAuth(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  verifyOtp: (email: string, token: string) =>
    fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    }).then(handle),

  changeEmail: (data: { id: string; email: string; token: string; new_email: string }) =>
    fetchWithAuth(`${BASE_URL}/auth/change-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  changePassword: (data: { email: string; token: string; password: string; new_password: string }) =>
    fetchWithAuth(`${BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),
};
