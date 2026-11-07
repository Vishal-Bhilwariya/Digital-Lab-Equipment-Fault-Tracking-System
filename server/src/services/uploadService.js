import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer memory storage (buffer)
const storage = multer.memoryStorage();

// File filter: accept images only (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

/**
 * Upload image buffer to Cloudinary, or fallback to Data URI for local dev
 */
export const uploadImageToCloud = async (fileBuffer, mimetype, folder = 'equipment_faults') => {
  // If Cloudinary configured
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
  ) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Graceful Local Fallback: Convert to base64 Data URI so development/testing works immediately
  const base64Data = fileBuffer.toString('base64');
  return `data:${mimetype};base64,${base64Data}`;
};
