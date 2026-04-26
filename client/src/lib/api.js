// ── Auth / JSON API → Node Express (port 5000) ─────────────────────────────
export function getToken() {
  return localStorage.getItem("token") || null;
}

export async function api(path, { method = "GET", body, token } = {}) {
  const jwt = token || getToken();
  const res = await fetch(`${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
}

// ── Whisper transcription → Flask (port 7860) ────────────────────────────────
export async function transcribeAudio(audioBlob, filename, task = "transcribe") {
  const formData = new FormData();
  formData.append("audio", audioBlob, filename);
  formData.append("task", task);

  const res = await fetch("/transcribe", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Transcription failed");
  }
  return data; // { transcript, language, duration, task }
}

