import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo', 
  api_key: process.env.CLOUDINARY_API_KEY || 'api_key', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'api_secret'
});

export default cloudinary;
