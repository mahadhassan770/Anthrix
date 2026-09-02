import { v2 as cloudinary } from "cloudinary";

/**
 * Dedicated ATS Cloudinary Configuration
 * Strictly isolated for candidate resumes and recruitment assets.
 */
export const getAtsCloudinaryConfig = () => ({
  cloud_name: process.env.ATS_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.ATS_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.ATS_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface AtsUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format?: string;
  bytes?: number;
}

/**
 * Upload a candidate resume directly to the dedicated ATS Cloudinary storage
 */
export async function uploadAtsResume(
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
  } = {}
): Promise<AtsUploadResult> {
  const config = getAtsCloudinaryConfig();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...config,
        folder: options.folder ?? "anthrix-ats/resumes",
        public_id: options.public_id,
        resource_type: "auto",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) reject(error || new Error("Failed to upload ATS resume"));
        else resolve(result as AtsUploadResult);
      }
    );
    uploadStream.end(buffer);
  });
}

export const getAtsCloudinary = () => {
  cloudinary.config(getAtsCloudinaryConfig());
  return cloudinary;
};

export const atsCloudinary = new Proxy(cloudinary, {
  get(target, prop) {
    cloudinary.config(getAtsCloudinaryConfig());
    return (target as any)[prop];
  },
});

