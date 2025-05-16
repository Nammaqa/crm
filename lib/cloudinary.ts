// lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (
  file: Buffer,
  fileName: string
): Promise<string | null> => {
  try {
    return new Promise((resolve, reject) => {
      const stream = streamifier.createReadStream(file);
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: fileName, folder: "employees", resource_type: "image" },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Failed:", error);
            reject(error);
          }
          if (result) {
            resolve(result.secure_url);
          } else {
            reject("Cloudinary upload failed with no result.");
          }
        }
      );
      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error("❌ Error uploading to Cloudinary:", error);
    return null;
  }
};
