import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    transformation?: object[];
  } = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
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
 * Delete an asset from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
