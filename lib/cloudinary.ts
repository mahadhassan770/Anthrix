import { v2 as cloudinary } from "cloudinary";

/**
 * Main Agency Website Cloudinary Configuration
 * Used for portfolio images, agency project assets, avatars, etc.
 */
export const getMainCloudinaryConfig = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a file buffer to Main Website Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    transformation?: object[];
  } = {}
): Promise<CloudinaryUploadResult> {
  const config = getMainCloudinaryConfig();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...config,
        folder: options.folder ?? "agency_portfolio",
        public_id: options.filename,
        overwrite: true,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as CloudinaryUploadResult);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Main Website Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const config = getMainCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, config as any);
}

export { cloudinary };
