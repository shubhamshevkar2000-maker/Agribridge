import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo', 
  api_key: process.env.CLOUDINARY_API_KEY || 'api_key', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'api_secret'
});

// Safe upload wrapper that falls back to returning the base64 string
export const safeUpload = async (image: string, options: any) => {
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'api_key') {
    return { secure_url: image };
  }
  return await cloudinary.uploader.upload(image, options);
};

export default cloudinary;
