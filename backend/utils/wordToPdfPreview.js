const { convert } = require('libreoffice-convert');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const CONVERSION_TIMEOUT_MS = 30000;

const allowedWordExtensions = new Set(['.doc', '.docx']);
const allowedWordMimeTypes = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function hasWordDocumentType(file) {
  const originalName = (file?.originalname || '').toLowerCase();
  const hasValidExtension = Array.from(allowedWordExtensions).some((ext) => originalName.endsWith(ext));
  const mimeType = (file?.mimetype || '').toLowerCase();
  const hasValidMimeType = allowedWordMimeTypes.has(mimeType);

  return hasValidExtension || hasValidMimeType;
}

function validateWordDocument(file) {
  if (!file) {
    const error = new Error('No file provided.');
    error.code = 'NO_FILE';
    throw error;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error = new Error('File too large. Maximum allowed size is 5MB.');
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  if (!hasWordDocumentType(file)) {
    const error = new Error('Only .doc and .docx files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }
}

async function convertWordToPdfBuffer(file) {
  validateWordDocument(file);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('The document could not be converted in time. Please try again.'));
    }, CONVERSION_TIMEOUT_MS);

    convert(file.buffer, 'pdf', undefined, (error, result) => {
      clearTimeout(timeout);

      if (error) {
        const conversionError = new Error('The document could not be converted to PDF. Please check that the file is valid and try again.');
        conversionError.code = 'CONVERSION_FAILED';
        reject(conversionError);
        return;
      }

      if (!result || !Buffer.isBuffer(result)) {
        const conversionError = new Error('The document could not be converted to PDF. Please check that the file is valid and try again.');
        conversionError.code = 'CONVERSION_FAILED';
        reject(conversionError);
        return;
      }

      resolve(result);
    });
  });
}

module.exports = {
  MAX_FILE_SIZE_BYTES,
  CONVERSION_TIMEOUT_MS,
  validateWordDocument,
  convertWordToPdfBuffer,
  hasWordDocumentType,
};
