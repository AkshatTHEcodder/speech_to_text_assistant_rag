# Whisper Studio — Smart Audio Transcription

A Flask-based Speech-to-Text web application powered by Whisper that allows users to upload or record audio, transcribe it into text, and download the results.

## Features
- ✨ **Whisper-Powered**: High accuracy transcription using OpenAI's Whisper model.
- 🎙️ **Direct Recording**: Record audio directly from your browser.
- 🌐 **Auto-Language Detection**: Automatically detects the language of the audio.
- 🌍 **Translation**: Translate non-English audio directly to English.
- 🚀 **GPU Optimized**: Automatically uses CUDA if available.

## Tech Stack
- **AI / STT Backend**: Flask (Python) + OpenAI Whisper
- **Auth Backend**: Node.js + Express + MongoDB
- **Frontend**: React (Vite) + TailwindCSS
- **Deployment**: Optimized for cloud platforms (Render, etc.)

## Prerequisites
- **FFmpeg**: Required by Whisper. On Windows, install via: `winget install Gyan.FFmpeg`
- **Node.js**: v18+
- **Python**: 3.10+
- **MongoDB**: A valid connection string in `server/.env`

## Getting Started

To run this application locally, you will need to open **three separate terminal windows**.

### 1. Flask STT Backend (Terminal 1)
This server handles the heavy lifting of audio transcription using OpenAI's Whisper model.
```bash
# 1. Open a new terminal in the project root
# 2. Install FFmpeg (Required by Whisper)
winget install Gyan.FFmpeg

# 3. Create a virtual environment
python -m venv venv

# 4. Activate the environment (Windows)
venv\Scripts\activate

# 5. Install the required Python packages
pip install -r requirements.txt

# 6. Start the Flask server (runs on port 7860)
python app.py
```

### 2. Node Auth Backend (Terminal 2)
This server manages user authentication (login/register) and connects to MongoDB.
```bash
# 1. Open a new terminal in the project root
# 2. Navigate to the server folder
cd server

# 3. Install Node.js dependencies
npm install

# 4. Ensure you have a valid .env file in the server directory
# Example server/.env:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# 5. Start the Node.js server (runs on port 5000)
npm start
```

### 3. React Frontend (Terminal 3)
This is the user interface built with Vite and React.
```bash
# 1. Open a new terminal in the project root
# 2. Navigate to the client folder
cd client

# 3. Install React dependencies
npm install

# 4. Ensure you have a valid .env file in the client directory
# Example client/.env:
# VITE_API_BASE=http://localhost:5000
# VITE_WHISPER_BASE=http://localhost:7860

# 5. Start the Vite development server (runs on port 5173)
npm run dev
```

### Accessing the App
Once all three servers are running:
1. Open your browser and go to `http://localhost:5173`
2. The Vite proxy will automatically route authentication requests to the Node server and transcription requests to the Flask server.

