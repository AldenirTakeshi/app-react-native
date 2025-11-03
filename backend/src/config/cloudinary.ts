import { v2 as cloudinary } from 'cloudinary';

const cloudinaryUrl = process.env.CLOUDINARY_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudinaryUrl) {
  cloudinary.config();
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  const missing = [];
  if (!cloudinaryUrl && !cloudName)
    missing.push('CLOUDINARY_URL ou CLOUDINARY_CLOUD_NAME');
  if (!cloudinaryUrl && !apiKey) missing.push('CLOUDINARY_API_KEY');
  if (!cloudinaryUrl && !apiSecret) missing.push('CLOUDINARY_API_SECRET');

  console.error(
    'Cloudinary não configurado. Variáveis faltando:',
    missing.join(', '),
  );
}

export default cloudinary;
