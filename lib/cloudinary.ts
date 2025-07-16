import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImagetoCloudinary(file: Buffer, folderName?: string) {
  const uploadOptions: Record<string, unknown> = { resource_type: 'auto' };
  if (folderName) uploadOptions.folder = folderName;
  return new Promise<string | undefined>((resolve, reject) => {
    cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) reject(err);
      else resolve((result as { secure_url?: string })?.secure_url);
    }).end(file);
  });
}


// Upload video to Cloudinary
export async function uploadVideoToCloudinary(file: Buffer, folderName?: string) {
  const uploadOptions: Record<string, unknown> = { resource_type: 'video' };
  if (folderName) uploadOptions.folder = folderName;
  return new Promise<string | undefined>((resolve, reject) => {
    cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) reject(err);
      else resolve((result as { secure_url?: string })?.secure_url);
    }).end(file);
  });
}

// Delete image from Cloudinary
export async function deleteImageFromCloudinary(url: string): Promise<boolean> {
  const { publicIdWithFolder } = extractCloudinaryInfo(url);
  if (!publicIdWithFolder) return false;
  return new Promise<boolean>((resolve) => {
    cloudinary.uploader.destroy(publicIdWithFolder, (error) => {
      resolve(!error);
    });
  });
}

// Delete video from Cloudinary
export async function deleteVideoFromCloudinary(url: string): Promise<boolean> {
  const { publicIdWithFolder } = extractCloudinaryInfo(url);
  if (!publicIdWithFolder) return false;
  return new Promise<boolean>((resolve) => {
    cloudinary.uploader.destroy(publicIdWithFolder, { resource_type: 'video' }, (error) => {
      resolve(!error);
    });
  });
}

function extractCloudinaryInfo(url: string) {
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  let publicIdWithFolder = '';
  if (match && match[1]) publicIdWithFolder = match[1];
  return { publicIdWithFolder };
}

export default cloudinary;