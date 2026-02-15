export const DURATIONS = {
  "1hr": 60 * 60 * 1000,
  "1day": 24 * 60 * 60 * 1000,
  "1week": 7 * 24 * 60 * 60 * 1000
};

export function formatDate(ts){
  const d = new Date(ts); return d.toLocaleString();
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

const apiBaseFromVite = import.meta.env?.VITE_API_BASE || "";
const apiBaseFromProcess = typeof process !== "undefined" && process.env
  ? process.env.REACT_APP_API_BASE
  : "";
const API_BASE = (apiBaseFromVite || apiBaseFromProcess || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY_PREFIX = "sendy:token:";

function buildUrl(path) {
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["X-Access-Token"] = token;

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.detail || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function normalizeDomain(data) {
  return {
    domain: data.domain,
    expiresAt: new Date(data.expires_at).getTime(),
    createdAt: new Date(data.created_at).getTime(),
    content: data.content || "",
    meta: {
      fontSize: data.meta?.font_size ?? 18,
      color: data.meta?.color ?? "#111827",
      bold: data.meta?.bold ?? false,
    },
    files: (data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.url || null,
      uploadedAt: file.uploaded_at ? new Date(file.uploaded_at).getTime() : Date.now(),
    })),
    isLocked: data.is_locked,
  };
}

export function setAccessToken(domain, token, expiresAt) {
  const payload = { token, expiresAt };
  sessionStorage.setItem(`${TOKEN_KEY_PREFIX}${domain}`, JSON.stringify(payload));
}

export function getAccessToken(domain) {
  try {
    const raw = sessionStorage.getItem(`${TOKEN_KEY_PREFIX}${domain}`);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload?.token || !payload?.expiresAt) return null;
    if (new Date(payload.expiresAt).getTime() <= Date.now()) return null;
    return payload.token;
  } catch (error) {
    return null;
  }
}

export async function createDomain({ domain, password, durationMs }) {
  return apiRequest("/domains", {
    method: "POST",
    body: { domain, password: password || null, duration_ms: durationMs },
  });
}

export async function unlockDomain(domain, password) {
  return apiRequest(`/domains/${domain}/unlock`, {
    method: "POST",
    body: { password },
  });
}

export async function getDomain(domain, token) {
  return apiRequest(`/domains/${domain}`, { token });
}

export async function updateDomain(domain, payload, token) {
  return apiRequest(`/domains/${domain}`, {
    method: "PUT",
    body: payload,
    token,
  });
}
