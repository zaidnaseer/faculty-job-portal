const express = require('express');
const multer = require('multer');
const { convertWordToPdfBuffer } = require('../utils/wordToPdfPreview');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const originalName = (file?.originalname || '').toLowerCase();
    const mimeType = (file?.mimetype || '').toLowerCase();
    const allowedExtensions = ['.doc', '.docx'];
    const allowedMimeTypes = new Set([
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);

    const isAllowedExtension = allowedExtensions.some((ext) => originalName.endsWith(ext));
    const isAllowedMimeType = allowedMimeTypes.has(mimeType);

    if (isAllowedExtension || isAllowedMimeType) {
      cb(null, true);
      return;
    }

    cb(new Error('Only .doc and .docx files are allowed.'));
  },
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided.' });
    }

    const pdfBuffer = await convertWordToPdfBuffer(req.file);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    const statusCode =
      error.code === 'NO_FILE' || error.code === 'INVALID_FILE_TYPE' ? 400 :
      error.code === 'FILE_TOO_LARGE' ? 413 :
      500;

    const clientMessage =
      error.code === 'NO_FILE' ? 'No file provided.' :
      error.code === 'INVALID_FILE_TYPE' ? 'Only .doc and .docx files are allowed.' :
      error.code === 'FILE_TOO_LARGE' ? 'File too large. Maximum allowed size is 5MB.' :
      error.code === 'CONVERSION_FAILED' ? 'The document could not be converted to PDF. Please check that the file is valid and try again.' :
      'Preview conversion failed. Please try again.';

    return res.status(statusCode).json({ message: clientMessage });
  }
});

module.exports = router;
