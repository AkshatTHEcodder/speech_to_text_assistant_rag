import os
import tempfile
from flask import Flask, request, jsonify, render_template
import whisper

app = Flask(__name__)

# 🔥 Load Whisper model (better accuracy)
print("Loading Whisper model...")
model = whisper.load_model("base") 
print("Model loaded successfully!")

ALLOWED_EXTENSIONS = {"wav", "mp3", "m4a", "ogg", "webm", "flac", "mp4"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    if audio_file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(audio_file.filename):
        return jsonify({"error": "Unsupported file format"}), 400

    # 👇 Get task from frontend
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
        if result.get("segments"):
            duration = result["segments"][-1].get("end", 0)

        return jsonify({
            "transcript": transcript,
            "language": language,
            "duration": round(duration, 2),
            "task": task
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860) 