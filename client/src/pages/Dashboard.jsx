import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transcribeAudio } from "../lib/api.js";

const MAX_SEC = 120;
const CIRC = 2 * Math.PI * 62;

export default function Dashboard() {
  const nav = useNavigate();
  const [taskMode, setTaskMode] = useState("transcribe");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState("🎙️ ready · smart mode");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState(false);

  const mrRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const progress = Math.min(seconds / MAX_SEC, 1);
  const offset = CIRC * (1 - progress);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  }

  function makePreview(blobOrFile) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!blobOrFile) { setPreviewUrl(null); return; }
    setPreviewUrl(URL.createObjectURL(blobOrFile));
  }

  function stopRecording() {
    if (mrRef.current?.state === "recording") mrRef.current.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setStatus("saved ✓ · ready");
    setTimeout(() => setStatus("🎙️ ready · smart mode"), 2000);
  }

  async function toggleMic() {
    if (isRecording) { stopRecording(); return; }
    setUploadedFile(null); setRecordedBlob(null); makePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "audio/ogg";
      const chunks = [];
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mrRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        setRecordedBlob(blob);
        makePreview(blob);
        setStatus("recording ready ✅");
      };
      mr.start(200);
      setIsRecording(true);
      setSeconds(0);
      setStatus("🔴 recording (max 2min)");
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= MAX_SEC) { stopRecording(); return MAX_SEC; }
          return s + 1;
        });
      }, 1000);
    } catch (e) { setError("Microphone error: " + e.message); }
  }

  function handleFile(file) {
    if (!file) return;
    if (file.size > 26 * 1024 * 1024) { setError("File too large (max 25 MB)"); return; }
    if (isRecording) stopRecording();
    setRecordedBlob(null);
    setUploadedFile(file);
    makePreview(file);
    setStatus("file loaded · ready");
    setTimeout(() => setStatus("🎙️ ready · smart mode"), 2000);
  }

  async function handleTranscribe() {
    const blob = recordedBlob || uploadedFile;
    if (!blob) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const filename = uploadedFile ? uploadedFile.name : "mic_recording.webm";
      const data = await transcribeAudio(blob, filename, taskMode);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function clearAll() {
    if (isRecording) stopRecording();
    setUploadedFile(null); setRecordedBlob(null); makePreview(null);
    setResult(null); setError(""); setSeconds(0);
    setStatus("🎙️ ready · smart mode");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const hasAudio = !!(recordedBlob || uploadedFile);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={S.page}>
      {/* Logout */}
      <button onClick={logout} style={S.logoutBtn}>Sign out</button>

      <div style={S.container}>
        {/* Hero */}
        <div style={S.hero}>
          <div style={S.badge}>⚡ whisper · smart diarization ready</div>
          <div style={S.brandRow}>
            <div style={S.logo}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                <path d="M12 3a3.25 3.25 0 0 0-3.25 3.25v6.25A3.25 3.25 0 0 0 12 15.75a3.25 3.25 0 0 0 3.25-3.25V6.25A3.25 3.25 0 0 0 12 3Z" fill="rgba(255,255,255,0.92)" />
                <path d="M17.5 11.25v1.25A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.5v-1.25" stroke="rgba(255,255,255,0.92)" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 18v2.2M9.1 20.2h5.8" stroke="rgba(255,255,255,0.92)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 style={S.h1}>Whisper Studio</h1>
          </div>
          <div style={S.subhead}>speech to text · noise-resilient · auto language detect</div>
        </div>

        {/* Card */}
        <div style={S.card}>
          {/* Mic */}
          <div style={S.recordZone}>
            <div style={{ position: "relative", width: 140, height: 140, cursor: "pointer", marginBottom: "0.75rem" }} onClick={toggleMic}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 140 140">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b74ff" />
                    <stop offset="100%" stopColor="#d67eff" />
                  </linearGradient>
                </defs>
                <circle cx="70" cy="70" r="62" fill="none" stroke="#2a2a48" strokeWidth="3.8" />
                <circle cx="70" cy="70" r="62" fill="none" stroke="url(#rg)" strokeWidth="3.8"
                  strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div style={{ ...S.micCore, ...(isRecording ? S.micCoreActive : {}) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={isRecording ? "#ff7b89" : "#dbd4ff"} strokeWidth="1.7" style={{ width: 48, height: 48 }}>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </div>
            </div>
            <div style={S.recStatus}>{status}</div>
            <div style={S.timer}>{fmt(seconds)}</div>
          </div>

          {/* Divider */}
          <div style={S.divider}><span>⤚ or import file ⤛</span></div>

          {/* Mode */}
          <div style={S.modeRow}>
            <span style={{ fontSize: "0.7rem", color: "#a6a6d3" }}>Mode</span>
            <div style={S.segmented}>
              {["transcribe", "translate"].map(m => (
                <button key={m} onClick={() => setTaskMode(m)}
                  style={{ ...S.segBtn, ...(taskMode === m ? S.segBtnActive : {}) }}>
                  {m === "transcribe" ? "✨ Transcribe" : "🌍 Translate → EN"}
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div
            style={{ ...S.uploadArea, ...(drag ? S.uploadDrag : {}) }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" style={{ display: "none" }}
              accept="audio/*,video/mp4,.wav,.mp3,.m4a,.ogg,.flac,.webm"
              onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            <div style={{ fontSize: "2.2rem" }}>🎵</div>
            <div style={{ fontSize: "0.85rem", color: "#c7c7f0" }}>
              drag & drop or <strong style={{ color: "#cdb2ff" }}>browse</strong> — up to 25MB
            </div>
            <div style={S.hint}>✨ smart format detection + whisper optimization</div>
          </div>

          {/* File preview */}
          {(uploadedFile || previewUrl) && (
            <div style={S.filePreview}>
              <span>📁</span>
              <span style={{ fontSize: "0.8rem", color: "#e3d6ff", flex: 1 }}>
                {uploadedFile ? uploadedFile.name : "mic_recording.webm"}
              </span>
              {uploadedFile && <span style={{ fontSize: "0.7rem", color: "#9696c0" }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>}
              <button onClick={clearAll} style={S.removeBtn}>✕</button>
            </div>
          )}

          {/* Audio preview */}
          {previewUrl && (
            <div style={S.audioPreview}>
              <span style={{ fontSize: "0.7rem", color: "#a9a9d8", whiteSpace: "nowrap" }}>▶ preview</span>
              <audio controls src={previewUrl} style={{ width: "100%", accentColor: "#a07eff" }} />
            </div>
          )}

          {/* Transcribe button */}
          <button onClick={handleTranscribe} disabled={!hasAudio || loading} style={{ ...S.transcribeBtn, ...(!hasAudio || loading ? S.transcribeBtnDisabled : {}) }}>
            {loading
              ? <><span style={S.loader} /> <span>AI transcribing…</span></>
              : <span>{taskMode === "translate" ? "🌍 translate with AI" : "✨ transcribe with AI"}</span>}
          </button>

          {/* Error */}
          {error && <div style={S.errorBox}>⚠️ {error}</div>}

          {/* Result */}
          {result && (
            <div style={S.resultCard}>
              <div style={S.resultHeader}>
                <span style={{ fontSize: "0.85rem", color: "#cdbfff" }}>📜 transcription + smart insights</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={S.pill}>🌐 {(result.language || "en").toUpperCase()}</span>
                  <span style={S.pill}>⏱️ {result.duration || 0}s</span>
                </div>
              </div>
              <div style={S.transcriptBody}>{result.transcript}</div>
              <div style={{ display: "flex", gap: "0.7rem", marginTop: "0.8rem" }}>
                <button style={S.actionBtn} onClick={() => {
                  navigator.clipboard.writeText(result.transcript);
                  setCopied(true); setTimeout(() => setCopied(false), 1500);
                }}>{copied ? "✓ copied" : "📋 copy"}</button>
                <button style={S.actionBtn} onClick={() => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(new Blob([result.transcript], { type: "text/plain" }));
                  a.download = `whisper_${Date.now()}.txt`; a.click();
                }}>⬇️ .txt</button>
                <button style={S.actionBtn} onClick={clearAll}>⟳ clear</button>
              </div>
            </div>
          )}
        </div>

        <footer style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.65rem", color: "#7575a3" }}>
          powered by Whisper API · auto language · duration estimation
        </footer>
      </div>
    </div>
  );
}

/* ── Inline styles (mirrors templates/index.html) ─────────────────────────── */
const S = {
  page: {
    background: "#0b0a17",
    backgroundImage: "radial-gradient(circle at 10% 20%, rgba(98,78,255,0.12) 0%, #03020a 90%)",
    fontFamily: "'DM Mono', monospace",
    color: "#f0effa",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1.5rem 4rem",
    position: "relative"
  },
  logoutBtn: {
    position: "absolute", top: "1.2rem", right: "1.5rem",
    background: "rgba(35,30,70,0.7)", border: "1px solid rgba(140,120,255,0.35)",
    borderRadius: "999px", padding: "0.35rem 1rem", fontSize: "0.7rem",
    color: "#cdbfff", cursor: "pointer", backdropFilter: "blur(8px)"
  },
  container: { maxWidth: 820, width: "100%", margin: "0 auto" },
  hero: { marginBottom: "2.5rem", textAlign: "center" },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(35,30,70,0.7)", backdropFilter: "blur(8px)",
    border: "1px solid rgba(140,120,255,0.45)", borderRadius: 60,
    padding: "0.35rem 1.2rem", fontSize: "0.7rem", letterSpacing: "0.2em",
    textTransform: "uppercase", fontWeight: 500, color: "#cdbfff", marginBottom: "1.2rem"
  },
  brandRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "0.5rem" },
  logo: {
    width: 54, height: 54, borderRadius: 16, display: "grid", placeItems: "center",
    background: "radial-gradient(circle at 30% 20%, rgba(191,168,255,.95) 0%, rgba(108,92,231,.9) 55%, rgba(11,10,23,1) 100%)",
    border: "1px solid rgba(180,158,255,0.35)"
  },
  h1: {
    fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.2rem,8vw,4rem)",
    fontWeight: 800, letterSpacing: "-0.02em",
    background: "linear-gradient(145deg,#fff,#cdbef5,#b29eff)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    margin: 0
  },
  subhead: { fontSize: "0.8rem", color: "#9f9fc7", borderTop: "1px dashed #333355", display: "inline-block", paddingTop: "0.6rem" },
  card: {
    background: "rgba(16,15,30,0.7)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(110,100,180,0.35)", borderRadius: "2rem",
    padding: "2rem", boxShadow: "0 25px 40px -12px rgba(0,0,0,0.5)"
  },
  recordZone: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" },
  micCore: {
    position: "absolute", inset: 12, background: "#12122a", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1.5px solid #43437a", boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    transition: "all 0.2s"
  },
  micCoreActive: { background: "rgba(220,70,100,0.12)", border: "1.5px solid #ff7b89", boxShadow: "0 0 0 3px rgba(255,80,120,0.4)" },
  recStatus: { fontSize: "0.75rem", background: "#10101c", padding: "0.3rem 1rem", borderRadius: 30, border: "1px solid #2f2f50", color: "#cacaff" },
  timer: { fontFamily: "'DM Mono',monospace", fontSize: "0.9rem", background: "#0a0a18", padding: "0.2rem 1rem", borderRadius: 30, marginTop: 6, border: "1px solid #39396b", color: "#f0edff" },
  divider: { display: "flex", alignItems: "center", gap: "1rem", margin: "1.6rem 0", color: "#6b6b97", fontSize: "0.7rem", textTransform: "uppercase" },
  modeRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "0.2rem 0 0.9rem", flexWrap: "wrap" },
  segmented: { background: "#0d0d1c", border: "1px solid #3a3a68", borderRadius: 999, padding: 4, display: "inline-flex", gap: 4 },
  segBtn: { border: 0, borderRadius: 999, padding: "0.45rem 0.75rem", fontFamily: "'DM Mono',monospace", fontSize: "0.7rem", color: "#d9d9ff", background: "transparent", cursor: "pointer" },
  segBtnActive: { background: "linear-gradient(115deg,rgba(108,92,231,.55),rgba(160,126,255,.55))", border: "1px solid rgba(180,158,255,0.35)", color: "#fff" },
  uploadArea: { border: "1.8px dashed #4a4a77", borderRadius: "1.5rem", background: "#0d0d1c", padding: "1.8rem 1rem", textAlign: "center", cursor: "pointer", marginBottom: "1rem" },
  uploadDrag: { borderColor: "#b49eff", background: "#14142c", boxShadow: "0 0 0 2px rgba(180,158,255,0.3)" },
  hint: { fontSize: "0.65rem", background: "#16162a", display: "inline-block", padding: "0.2rem 0.7rem", borderRadius: 20, marginTop: "0.5rem", color: "#aaa9e0" },
  filePreview: { background: "#121226", borderRadius: "1.2rem", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.8rem", border: "1px solid #37376b" },
  removeBtn: { background: "none", border: "none", color: "#c0b9f0", cursor: "pointer", fontSize: "1.1rem" },
  audioPreview: { background: "#0b0b19", border: "1px solid #2e2e56", borderRadius: "1.2rem", padding: "0.8rem 0.9rem", display: "flex", gap: 10, alignItems: "center", marginBottom: "1rem" },
  transcribeBtn: {
    width: "100%", background: "linear-gradient(115deg,#6c5ce7,#a07eff)", border: "none",
    padding: "1rem", borderRadius: "1.4rem", fontFamily: "'Syne',sans-serif",
    fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase",
    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, cursor: "pointer"
  },
  transcribeBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  loader: { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderRadius: "50%", borderTopColor: "white", animation: "spin 0.7s linear infinite", display: "inline-block" },
  errorBox: { background: "rgba(255,90,110,0.1)", borderLeft: "3px solid #ff9f9f", padding: "0.7rem 1rem", borderRadius: "1rem", fontSize: "0.75rem", color: "#ffbebe", marginTop: "1rem" },
  resultCard: { marginTop: "2rem", background: "#0c0c1c", borderRadius: "1.4rem", border: "1px solid #3d3d6b", padding: "1.2rem" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: "0.8rem" },
  pill: { background: "#1c1c32", borderRadius: 40, padding: "0.2rem 0.8rem", fontSize: "0.65rem", color: "#cbc9ff" },
  transcriptBody: { background: "#070713", borderRadius: "1rem", padding: "1.2rem", fontSize: "0.9rem", lineHeight: 1.55, border: "1px solid #2e2e56", color: "#f1f0fe", whiteSpace: "pre-wrap", wordBreak: "break-word" },
  actionBtn: { background: "#151528", border: "1px solid #414177", fontFamily: "'DM Mono',monospace", fontSize: "0.7rem", padding: "0.5rem 0.9rem", borderRadius: "2rem", cursor: "pointer", color: "#dedeff" }
};
