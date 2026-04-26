# Project Memory

## Optimized and Debugged - 2026-04-25
- **Flask Backend (`app.py`)**: 
  - Added CUDA support for faster transcription.
  - Enabled CORS for cross-origin frontend communication.
  - Fixed a crash occurring on empty audio input.
- **Frontend (`templates/index.html`)**:
  - Improved `MediaRecorder` compatibility for non-Chrome browsers.
  - Implemented accurate duration tracking using audio metadata.
- **Auth Frontend (`Login.jsx`)**:
  - Fixed the successful login redirect bug (now points to `/` instead of `/login`).
- **Dependencies**:
  - Standardized `requirements.txt`.

## Architecture Integration - 2026-04-26
- **Frontend Modernization**: 
  - Migrated vanilla HTML frontend into a React `Dashboard.jsx` component.
  - Set up Vite proxy to handle split-backend routing (`/api` to Node:5000, `/transcribe` to Flask:7860).
  - Protected Dashboard route requiring MongoDB-backed JWT authentication.
- **Environment**:
  - Added FFmpeg to system requirements (via winget) for Whisper STT processing.
  - Added audio/media file extensions to `.gitignore`.
