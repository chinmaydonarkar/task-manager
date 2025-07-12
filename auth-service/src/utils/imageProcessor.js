const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Process and resize uploaded image
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {string} filename - Original filename
 * @param {number} width - Target width (default: 200)
 * @param {number} height - Target height (default: 200)
 * @returns {Promise<{filename: string, filepath: string}>}
 */
const processImage = async (imageBuffer, filename, width = 200, height = 200) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(filename);
    const processedFilename = `avatar_${timestamp}${extension}`;
    const filepath = path.join(uploadDir, processedFilename);

    // Process image with sharp
    await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    return {
      filename: processedFilename,
      filepath: filepath,
      url: `/uploads/avatars/${processedFilename}`
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Delete image file
 * @param {string} filename - Filename to delete
 */
const deleteImage = (filename) => {
  try {
    const filepath = path.join(__dirname, '../../uploads/avatars', filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Image deletion error:', error);
  }
};

module.exports = {
  processImage,
  deleteImage
}; 