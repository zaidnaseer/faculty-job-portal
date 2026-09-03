const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const hasR2Config = !!(
  process.env.R2_ENDPOINT &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

const s3Client = hasR2Config ? new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
}) : null;

async function getPrivateResumeUrl(key, expiresInSeconds = 300) {
  if (!hasR2Config || !s3Client || !key) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

async function deleteResumeFromR2(key) {
  if (!hasR2Config || !s3Client || !key) {
    return;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

async function copyResumeForApplication(key, userId, filename) {
  if (!hasR2Config || !s3Client || !key) {
    return null;
  }

  const safeName = (filename || "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "-");
  const snapshotKey = `application-resumes/${userId}/${Date.now()}-${safeName}`;

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CopySource: `${process.env.R2_BUCKET_NAME}/${key}`,
      Key: snapshotKey,
    })
  );

  return snapshotKey;
}

async function uploadResumeToR2(file, userId) {
  if (!file) {
    return null;
  }

  if (!hasR2Config || !s3Client) {
    throw new Error('Cloudflare R2 is not configured. Add R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.');
  }

  const safeName = file.originalname
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-');

  const key = `resumes/${userId}/${Date.now()}-${safeName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: safeName,
      },
    })
  );

  return {
    url: null,
    key,
    filename: safeName,
    size: file.size,
    contentType: file.mimetype,
  };
}

module.exports = {
  uploadResumeToR2,
  getPrivateResumeUrl,
  deleteResumeFromR2,
  copyResumeForApplication,
};
