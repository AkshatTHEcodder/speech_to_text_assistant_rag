import os
import tempfile
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import whisper

app = Flask(__name__)

# ── Security: CORS ────────────────────────────────────────────────────────────
# In production, set ALLOWED_ORIGINS env var to your deployed domain(s).
# e.g. ALLOWED_ORIGINS=https://myapp.onrender.com,https://myapp.com
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:7860")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

CORS(app, origins=ALLOWED_ORIGINS, methods=["GET", "POST"], supports_credentials=False)

# ── Security: Rate limiting ───────────────────────────────────────────────────
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# ── Security: Response headers middleware ─────────────────────────────────────
@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Only send HSTS in production
    if os.getenv("NODE_ENV") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# ── Whisper model loading ─────────────────────────────────────────────────────
import torch
device = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
print(f"Loading Whisper '{MODEL_SIZE}' model on {device}...")
model = whisper.load_model(MODEL_SIZE, device=device)
print("Model loaded successfully!")

ALLOWED_EXTENSIONS = {"wav", "mp3", "m4a", "ogg", "webm", "flac", "mp4"}
MAX_FILE_BYTES = int(os.getenv("MAX_UPLOAD_MB", "25")) * 1024 * 1024

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/transcribe", methods=["POST"])
@limiter.limit("20 per minute")  # Prevent abuse of the heavy Whisper endpoint
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    if audio_file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(audio_file.filename):
        return jsonify({"error": "Unsupported file format"}), 400

    # Read into memory first to check size without saving to disk yet
    audio_file.stream.seek(0, 2)
    file_size = audio_file.stream.tell()
    audio_file.stream.seek(0)

    if file_size > MAX_FILE_BYTES:
        return jsonify({"error": f"File too large. Max {os.getenv('MAX_UPLOAD_MB', '25')}MB allowed"}), 413

    task = request.form.get("task", "transcribe")
    if task not in ("transcribe", "translate"):
        task = "transcribe"

    suffix = "." + audio_file.filename.rsplit(".", 1)[1].lower()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        print("Processing:", tmp_path, "| Task:", task)
        result = model.transcribe(tmp_path, task=task)

        transcript = result.get("text", "").strip()
        language = result.get("language", "unknown")

        duration = 0
        segments = result.get("segments")
        if segments:
            duration = segments[-1].get("end", 0)

        return jsonify({
            "transcript": transcript,
            "language": language,
            "duration": round(duration, 2),
            "task": task
        })

    except Exception as e:
        print("Error:", str(e))
        # Don't leak internal error details in production
        msg = str(e) if os.getenv("NODE_ENV") != "production" else "Transcription failed"
        return jsonify({"error": msg}), 500

    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))
    debug = os.getenv("NODE_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)