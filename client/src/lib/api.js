// In dev: Vite proxy intercepts these. In prod: point .env vars to deployed URLs.
const API_BASE = import.meta.env.VITE_API_BASE || "";
const WHISPER_BASE = import.meta.env.VITE_WHISPER_BASE || "";

export function getToken() {
  return localStorage.getItem("token") || null;
}

// ── Auth / JSON API → Node Express ───────────────────────────────────────────
export async function api(path, { method = "GET", body, token } = {}) {
  const jwt = token || getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

// ── Whisper transcription → Flask ────────────────────────────────────────────
export async function transcribeAudio(audioBlob, filename, task = "transcribe") {
  const formData = new FormData();
  formData.append("audio", audioBlob, filename);
  formData.append("task", task);

  const res = await fetch(`${WHISPER_BASE}/transcribe`, { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Transcription failed");
  return data; // { transcript, language, duration, task }
}


