import { v2 as cloudinary } from "cloudinary";

// Configure dedicated ATS Cloudinary instance
cloudinary.config({
  cloud_name: process.env.ATS_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.ATS_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.ATS_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const atsCloudinary = cloudinary;
