# Faculty Job Portal

## Resume Word preview setup

This app previews uploaded Word resumes by converting them to PDF on the backend using LibreOffice in headless mode.

### Required system dependency

Install LibreOffice on the machine or container where the backend runs.

- Local macOS (Homebrew):
  `brew install --cask libreoffice`
- Local Ubuntu/Debian:
  `sudo apt-get update && sudo apt-get install -y libreoffice`
- Production container / VM:
  install the LibreOffice package for the target OS, then ensure the `soffice` binary is available on `PATH`.

The conversion logic lives in `backend/utils/wordToPdfPreview.js` and is exposed through `POST /api/preview`.

### Backend dependencies

From the `backend` directory:

```bash
npm install
```

The app uses the `libreoffice-convert` package to trigger a server-side `soffice --headless --convert-to pdf` conversion without writing the original document to disk.

### Notes

- The original uploaded file stays in memory only and is not persisted.
- Conversion runs with a timeout to prevent malformed files from hanging the process.
- This is intentionally isolated behind a single conversion function so it can later be swapped to a queued worker or a different implementation without changing the API contract.
- The LibreOffice process can have a cold start cost on the first conversion request, so the preview may take a couple seconds to appear on initial use.
