const MAX_PROFILE_IMAGE_DIMENSION = 10000;
const MIN_PROFILE_IMAGE_DIMENSION = 100;

const readUInt24LE = (buffer, offset) => (
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
);

const getJpegDimensions = (buffer) => {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return null;
    }

    let offset = 2;
    while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        const marker = buffer[offset + 1];
        offset += 2;
        if (marker === 0xd8 || marker === 0xd9) continue;
        if (marker >= 0xd0 && marker <= 0xd7) continue;
        if (offset + 2 > buffer.length) return null;

        const segmentLength = buffer.readUInt16BE(offset);
        if (segmentLength < 2 || offset + segmentLength > buffer.length) return null;

        const isStartOfFrame = (
            marker >= 0xc0 && marker <= 0xc3
        ) || (
                marker >= 0xc5 && marker <= 0xc7
            ) || (
                marker >= 0xc9 && marker <= 0xcb
            ) || (
                marker >= 0xcd && marker <= 0xcf
            );

        if (isStartOfFrame && offset + 7 <= buffer.length) {
            return {
                width: buffer.readUInt16BE(offset + 5),
                height: buffer.readUInt16BE(offset + 3),
            };
        }

        offset += segmentLength;
    }

    return null;
};

const getImageDimensions = (buffer) => {
    if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        return {
            mimeType: 'image/png',
            width: buffer.readUInt32BE(16),
            height: buffer.readUInt32BE(20),
        };
    }

    if (buffer.length >= 10 && (buffer.subarray(0, 6).toString() === 'GIF87a' || buffer.subarray(0, 6).toString() === 'GIF89a')) {
        return {
            mimeType: 'image/gif',
            width: buffer.readUInt16LE(6),
            height: buffer.readUInt16LE(8),
        };
    }

    if (buffer.length >= 30 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') {
        const chunkType = buffer.subarray(12, 16).toString();
        if (chunkType === 'VP8X') {
            return {
                mimeType: 'image/webp',
                width: 1 + readUInt24LE(buffer, 24),
                height: 1 + readUInt24LE(buffer, 27),
            };
        }

        if (chunkType === 'VP8 ' && buffer.length >= 30) {
            return {
                mimeType: 'image/webp',
                width: buffer.readUInt16LE(26) & 0x3fff,
                height: buffer.readUInt16LE(28) & 0x3fff,
            };
        }

        if (chunkType === 'VP8L' && buffer.length >= 25) {
            return {
                mimeType: 'image/webp',
                width: 1 + (buffer[21] | ((buffer[22] & 0x3f) << 8)),
                height: 1 + (((buffer[22] & 0xc0) >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x03) << 10)),
            };
        }
    }

    const jpegDimensions = getJpegDimensions(buffer);
    return jpegDimensions ? { ...jpegDimensions, mimeType: 'image/jpeg' } : null;
};

const validateProfileImage = (file) => {
    if (!file?.buffer) {
        throw new Error('Profile image data is missing.');
    }

    const dimensions = getImageDimensions(file.buffer);
    if (!dimensions) {
        throw new Error('The uploaded file is not a valid JPEG, PNG, WEBP, or GIF image.');
    }

    if (dimensions.mimeType !== file.mimetype) {
        throw new Error('The uploaded file content does not match its declared image type.');
    }

    if (
        dimensions.width < MIN_PROFILE_IMAGE_DIMENSION ||
        dimensions.height < MIN_PROFILE_IMAGE_DIMENSION ||
        dimensions.width > MAX_PROFILE_IMAGE_DIMENSION ||
        dimensions.height > MAX_PROFILE_IMAGE_DIMENSION
    ) {
        throw new Error(`Profile images must be between ${MIN_PROFILE_IMAGE_DIMENSION}px and ${MAX_PROFILE_IMAGE_DIMENSION}px in width and height.`);
    }

    return dimensions;
};

module.exports = { validateProfileImage };
